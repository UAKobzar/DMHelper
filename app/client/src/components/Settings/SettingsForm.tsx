import React, { useEffect, useState } from "react";
import { Settings } from "@dmhelper/shared";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";

interface SettingsFormProps {
  settings: Settings | null;
  onSave: (settings: Partial<Settings>) => Promise<void>;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Settings>>({
    provider: "anthropic",
    model: "claude-opus-4-6",
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    await onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="provider">LLM Provider</Label>
        <Select
          id="provider"
          value={formData.provider || ""}
          onChange={(e) =>
            setFormData({ ...formData, provider: e.target.value })
          }
        >
          <option value="anthropic">Anthropic Claude</option>
          <option value="openai">OpenAI</option>
          <option value="ollama">Ollama</option>
          <option value="llamacpp">llama.cpp</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          value={formData.model || ""}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          placeholder="e.g., claude-opus-4-6"
        />
      </div>

      <div>
        <Label htmlFor="serverUrl">Server URL (optional)</Label>
        <Input
          id="serverUrl"
          value={formData.serverUrl || ""}
          onChange={(e) =>
            setFormData({ ...formData, serverUrl: e.target.value })
          }
          placeholder="e.g., http://localhost:8080"
        />
      </div>

      <Button onClick={handleSave} className="w-full">
        Save Settings
      </Button>
    </div>
  );
};
