from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Azure Document Intelligence
    azure_di_endpoint: str = ""
    azure_di_api_key: str = ""

    # Azure OpenAI
    azure_openai_endpoint: str = ""
    azure_openai_api_key: str = ""
    azure_openai_text_deployment: str = "gpt-4o-mini"
    azure_openai_vision_deployment: str = "gpt-4o"
    azure_openai_embedding_deployment: str = "text-embedding-3-small"

    # Azure AI Vision
    azure_vision_endpoint: str = ""
    azure_vision_api_key: str = ""

    # Azure AI Search
    azure_search_endpoint: str = ""
    azure_search_api_key: str = ""
    azure_search_index_name: str = "switchgear-chunks"

    # ABB Sales Configurator (filterSelector API)
    abb_configurator_url: str = "https://medium-voltage-devices.salesconfigurator.abb.com/ELDS/api/filterSelector"
    abb_configurator_token: str = ""   # leave blank to use the built-in guest token

    # Service
    port: int = 8001
    log_level: str = "info"

    @property
    def is_azure_openai(self) -> bool:
        """True for real Azure OpenAI resources; False for GitHub Models inference endpoint."""
        return "openai.azure.com" in self.azure_openai_endpoint

    def make_openai_client(self):
        """Return the correct OpenAI client for the configured endpoint."""
        if self.is_azure_openai:
            from openai import AzureOpenAI
            return AzureOpenAI(
                azure_endpoint=self.azure_openai_endpoint,
                api_key=self.azure_openai_api_key,
                api_version="2024-12-01-preview",
                timeout=90.0,   # structured output calls can be slow; allow more time
            max_retries=0,  # manual retry in each extractor — SDK retry doubles wait time unnecessarily
        )
        from openai import OpenAI
        return OpenAI(
            base_url=self.azure_openai_endpoint,
            api_key=self.azure_openai_api_key,
            timeout=90.0,
            max_retries=0,
        )


settings = Settings()
