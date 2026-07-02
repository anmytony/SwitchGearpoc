using Microsoft.EntityFrameworkCore;
using SwitchgearApi.Data;
using SwitchgearApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

// Configure DbContext
if (builder.Environment.IsDevelopment())
{
    // Use local SQL Server (LocalDB) for development
    builder.Services.AddDbContext<SwitchgearDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
            sqlOptions => sqlOptions
                .CommandTimeout(120)
                .EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null)));
}
else
{
    builder.Services.AddDbContext<SwitchgearDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
            sqlOptions => sqlOptions
                .CommandTimeout(120)
                .EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null)));
}

// Text extraction — Azure Document Intelligence (prebuilt-layout: lines + tables) with local fallback.
// Configure AzureDocumentIntelligence:Endpoint and AzureDocumentIntelligence:ApiKey in appsettings.
builder.Services.AddSingleton<IDocumentIntelligenceService, AzureDocumentIntelligenceService>();

// Primary parameter extractor — GitHub Models (gpt-4o-mini) via Azure.AI.Inference.
// Endpoint: https://models.inference.ai.azure.com  ApiKey: GitHub PAT  DeploymentName: gpt-4o-mini
// Disabled-but-safe when not configured; regex supplement always runs alongside the LLM.
builder.Services.AddSingleton<ILlmParameterExtractionService, AzureOpenAIExtractionService>();

// SLD vision extractor — calls a vision-capable model (gpt-4o / gpt-4o-mini) to analyze
// switchgear single-line diagram images and extract system parameters + panel topology.
// Configure AzureOpenAI:VisionDeploymentName (falls back to DeploymentName) in appsettings.
// Gracefully disabled when not configured; text extraction continues unaffected.
builder.Services.AddSingleton<ISldVisionExtractionService, SldVisionExtractionService>();

// Multi-instance extraction — detects multiple switchgear installations in one document
// and extracts parameters per-installation in a single LLM call.
// Uses the same AzureOpenAI credentials as the primary extractor.
builder.Services.AddSingleton<IMultiInstanceExtractionService, MultiInstanceExtractionService>();

builder.Services.AddScoped<IDocumentProcessingService, DocumentProcessingService>();
builder.Services.AddScoped<IPipelineOrchestrationService, PipelineOrchestrationService>();

// Python AI extraction microservice (Path B RAG + Path C Grounded Vision)
// Falls back gracefully when service is down — LLM path continues unaffected.
builder.Services.AddHttpClient<IPythonExtractionClient, PythonExtractionClient>(client =>
{
    var baseUrl = builder.Configuration["PythonExtraction:BaseUrl"] ?? "http://localhost:8000";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(240); // 4 min hard cap — matches frontend polling window
});
builder.Services.AddScoped<IParameterExtractionService, ParameterExtractionService>();
builder.Services.AddScoped<ILineupReconstructionService, LineupReconstructionService>();
builder.Services.AddHttpClient("AbbSalesConfigurator", c =>
{
    c.BaseAddress = new Uri("https://medium-voltage-devices.salesconfigurator.abb.com");
    c.Timeout = TimeSpan.FromSeconds(8);
});
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<IAbbSalesConfiguratorClient, AbbSalesConfiguratorClient>();
builder.Services.AddSingleton<IAbbProductMatchingService, AbbProductMatchingService>();

// Ensemble voting — merges Level 1 results from all extraction paths
builder.Services.AddSingleton<IEnsembleVotingService, EnsembleVotingService>();

// Topology classifier — pure C# from SLD vision result
builder.Services.AddSingleton<ISldTopologyService, SldTopologyService>();

// Path B — RAG Level 1 extraction (requires AzureAISearch config; degrades gracefully)
builder.Services.AddSingleton<IRagParameterExtractionService, RagParameterExtractionService>();

// Path B — Level 2 cubicle schedule extraction from text pages
builder.Services.AddSingleton<ICubicleScheduleExtractionService, CubicleScheduleExtractionService>();

// Path C — Level 2 device mapping from SLD vision result
builder.Services.AddSingleton<ISldDeviceLevelExtractionService, SldDeviceLevelExtractionService>();
builder.Services.AddSingleton<ISldPanelSegmentationService, SldPanelSegmentationService>();

builder.Services.AddScoped<IXmlGenerationService, XmlGenerationService>();
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "ABB Switchgear API",
        Version = "v1",
        Description = "API for RFQ document processing and ABB switchgear configuration"
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        var allowed = new List<string> { "http://localhost:4200", "http://localhost:4201" };
        // Additional origins injected at runtime (e.g. Azure Static Web App URL)
        var extra = builder.Configuration["Cors:AllowedOrigins"];
        if (!string.IsNullOrWhiteSpace(extra))
            allowed.AddRange(extra.Split(',', StringSplitOptions.RemoveEmptyEntries));
        policy.WithOrigins([.. allowed])
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors("AllowAngular");

// Global exception handler — returns JSON { "error": "..." } for all unhandled exceptions
// instead of an empty 500 or the default HTML problem-details page.
app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    ctx.Response.StatusCode = 500;
    ctx.Response.ContentType = "application/json";
    var feature = ctx.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
    var msg = feature?.Error?.Message ?? "An unexpected error occurred.";
    await ctx.Response.WriteAsJsonAsync(new { error = msg });
}));

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}


// Map document controller routes
app.MapControllers();

// Warm up DB connection and ABB token in parallel at startup so the first request is fast
_ = Task.Run(async () =>
{
    try
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SwitchgearApi.Data.SwitchgearDbContext>();
        await db.Database.CanConnectAsync();
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "[Startup] DB warm-up failed — first request may be slower");
    }
});

app.Run();
