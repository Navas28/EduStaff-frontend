"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

function buildPayload({ name, email, temporaryPassword }) {
  const loginUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : "/login";

  return [
    "🎓 Welcome to EduStaff Portal!",
    "-----------------------------------",
    `Login URL: ${loginUrl}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Temporary Password: ${temporaryPassword}`,
    "-----------------------------------",
    "Please log in and update your password from your profile settings.",
  ].join("\n");
}

export default function CredentialsModal({ credentials, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!credentials) return null;

  const payload = buildPayload(credentials);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={Boolean(credentials)} onClose={onClose} title="Copy credentials">
      <p className="mb-3 text-sm text-ink-muted">
        Share this with {credentials.name} via WhatsApp, SMS, or in person. It won&apos;t be shown
        again.
      </p>
      <pre className="whitespace-pre-wrap rounded-md border border-border bg-paper p-4 text-xs text-ink">
        {payload}
      </pre>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Done
        </Button>
        <Button onClick={handleCopy}>{copied ? "Copied!" : "Copy credentials"}</Button>
      </div>
    </Modal>
  );
}
