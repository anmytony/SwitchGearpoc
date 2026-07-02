using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using SwitchgearApi.Models;

namespace SwitchgearApi.Services
{
    /// <summary>
    /// Generates ABB-compliant XML configuration for product configurator.
    /// Includes confidence scores and traceability information.
    /// REQUIRES HUMAN REVIEW - XML schema must be validated against ABB XSD.
    /// </summary>
    public interface IXmlGenerationService
    {
        Task<string> GenerateAbbXmlAsync(DocumentPackage package, List<ExtractedParameter> parameters, 
            List<SwitchgearCubicle> lineup);
    }

    public class XmlGenerationService : IXmlGenerationService
    {
        public async Task<string> GenerateAbbXmlAsync(DocumentPackage package, 
            List<ExtractedParameter> parameters, List<SwitchgearCubicle> lineup)
        {
            // Build XML structure for ABB configurator
            var config = new XElement("SwitchgearConfiguration",
                new XAttribute("Version", "1.0"),
                new XAttribute("GeneratedAt", DateTime.UtcNow.ToString("O")),
                new XAttribute("DocumentId", package.Id),
                new XAttribute("OverallConfidence", Math.Round(package.OverallConfidence, 2))
            );

            // System Parameters section
            var systemParams = new XElement("SystemParameters");
            foreach (var param in parameters)
            {
                systemParams.Add(new XElement("Parameter",
                    new XAttribute("Name", param.Name),
                    new XAttribute("Value", param.Value),
                    new XAttribute("Unit", param.Unit ?? ""),
                    new XAttribute("Confidence", Math.Round(param.ConfidenceScore, 2)),
                    new XAttribute("SourcePage", param.SourcePageNumber),
                    new XAttribute("FlaggedForReview", param.FlaggedForReview)
                ));
            }
            config.Add(systemParams);

            // Lineup section
            var lineupElement = new XElement("Lineup");
            foreach (var cubicle in lineup.OrderBy(c => c.Position))
            {
                var cubicleElement = new XElement("Cubicle",
                    new XAttribute("Position", cubicle.Position),
                    new XAttribute("Type", cubicle.Type),
                    new XAttribute("ProductFamily", cubicle.AbbProductFamily),
                    new XAttribute("ArticleNumber", cubicle.AbbArticleNumber ?? "TBD"),
                    new XAttribute("Quantity", cubicle.Quantity),
                    new XAttribute("Confidence", Math.Round(cubicle.ConfidenceScore, 2))
                );

                // Devices in this cubicle
                foreach (var device in cubicle.Devices)
                {
                    cubicleElement.Add(new XElement("Device",
                        new XAttribute("Type", device.DeviceType),
                        new XAttribute("ArticleNumber", device.AbbArticleNumber ?? "TBD"),
                        new XAttribute("Description", device.Description ?? ""),
                        new XAttribute("Quantity", device.Quantity),
                        new XAttribute("Confidence", Math.Round(device.ConfidenceScore, 2))
                    ));
                }

                lineupElement.Add(cubicleElement);
            }
            config.Add(lineupElement);

            // Create XML document
            var doc = new XDocument(
                new XDeclaration("1.0", "utf-8", "yes"),
                config
            );

            return doc.ToString();
        }
    }
}
