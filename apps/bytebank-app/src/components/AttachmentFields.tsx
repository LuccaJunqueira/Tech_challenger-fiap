"use client";

import { Input } from "@bytebank/ui";
import { Upload, X } from "lucide-react";
import { useState } from "react";

interface AttachmentFieldsProps {
  anexo: string;
  urlAnexo: string;
  onChange: (field: "anexo" | "urlAnexo", value: string) => void;
}

export function AttachmentFields({
  anexo,
  urlAnexo,
  onChange,
}: AttachmentFieldsProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleUrlChange = (value: string) => {
    onChange("urlAnexo", value);
    if (value.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      setPreview(value);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="space-y-3">
      <Input
        label="Descrição do anexo (opcional)"
        id="anexo"
        type="text"
        placeholder="Ex: Comprovante de pagamento"
        value={anexo}
        onChange={(e) => onChange("anexo", e.target.value)}
      />

      <div className="relative">
        <Input
          label="URL do anexo (opcional)"
          id="urlAnexo"
          type="url"
          placeholder="https://..."
          value={urlAnexo}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
        {urlAnexo && (
          <button
            type="button"
            onClick={() => handleUrlChange("")}
            className="absolute right-2 top-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {preview && (
        <a
          href={preview}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-neon-cyan hover:underline"
        >
          <Upload className="w-4 h-4" />
          Visualizar anexo
        </a>
      )}
    </div>
  );
}
