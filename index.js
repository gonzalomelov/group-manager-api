const express = require("express");
const { KubeConfig, CoreV1Api } = require("@kubernetes/client-node");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const kc = new KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(CoreV1Api);

app.post("/create-group-chat", async (req, res) => {
  try {
    const podManifest = {
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: `group-chat-${Date.now()}`,
        labels: { app: "group-chat" },
      },
      spec: {
        containers: [
          {
            name: "group-chat",
            image: "gonzalomelov17/group-chat:latest",
            env: [
              { name: "OPEN_AI_API_KEY", value: process.env.OPEN_AI_API_KEY },
              { name: "STACK_API_KEY", value: process.env.STACK_API_KEY },
              { name: "MSG_LOG", value: process.env.MSG_LOG },
            ],
          },
        ],
      },
    };

    const { body } = await k8sApi.createNamespacedPod("default", podManifest);
    res.json({
      message: "Group chat instance created",
      podName: body.metadata.name,
    });
  } catch (error) {
    console.error("Error creating group chat instance:", error.message);
    res.status(500).json({ error: "Failed to create group chat instance", details: error.message });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));