import Integration from "../../models/integrationModel.js";

function serializeIntegration(integration) {
  return {
    id: integration._id,
    script: integration.script,
    token: integration.token ?? "",
    endpointDomain: integration.endpointDomain ?? "https://backend.atenxion.ai/api",
    isActive: integration.isActive,
    createdAt: integration.createdAt,
    updatedAt: integration.updatedAt,
  };
}

function isValidWidgetScript(script) {
  return /^<script\b[^>]*\bsrc=["'][^"']+["'][^>]*>\s*<\/script>$/i.test(
    script,
  );
}

function isValidAccessToken(token) {
  if (!token) {
    return true;
  }

  return /^[A-Za-z0-9._:-]{3,512}$/.test(token);
}

export async function getIntegration(_req, res) {
  const integration = await Integration.findOne({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();
  console.log("integration", integration);
  return res.json({
    integration: integration ? serializeIntegration(integration) : null,
  });
}

export async function createIntegration(req, res) {
  const script = String(req.body.script ?? "").trim();
  const token = String(req.body.token ?? "").trim();
  const endpointDomain = String(req.body.endpointDomain ?? "https://backend.atenxion.ai/api").trim();

  if (!script) {
    return res.status(400).json({ message: "Widget script is required." });
  }

  if (!isValidWidgetScript(script)) {
    return res.status(400).json({
      message: "Widget script must be a full script tag with a src attribute.",
    });
  }

  if (!isValidAccessToken(token)) {
    return res.status(400).json({
      message:
        "Access token can contain only letters, numbers, dots, underscores, colons, and hyphens.",
    });
  }

  const existing = await Integration.findOne({ isActive: true }).lean();

  if (existing) {
    return res
      .status(409)
      .json({
        message: "Remove the current integration before adding another one.",
      });
  }

  const integration = await Integration.create({
    script,
    token,
    endpointDomain,
    isActive: true,
  });

  return res.status(201).json({
    integration: serializeIntegration(integration),
  });
}

export async function removeIntegration(req, res) {
  const integration = await Integration.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: false } },
    { new: true },
  );

  if (!integration) {
    return res.status(404).json({ message: "Integration not found." });
  }

  return res.json({ message: "Integration removed." });
}
