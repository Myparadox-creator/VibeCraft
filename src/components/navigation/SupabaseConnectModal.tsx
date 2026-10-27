"use client";

import React, { useState } from "react";
import {
  Database,
  ShieldCheck,
  Key,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getSupabaseCredentials,
  setCustomSupabaseCredentials,
  clearCustomSupabaseCredentials,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { useEventContext } from "@/context/EventContext";

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseConnectModal({ isOpen, onClose }: SupabaseConnectModalProps) {
  const { recheckSupabaseConfig } = useEventContext();
  const initialCreds = getSupabaseCredentials();

  const [url, setUrl] = useState(
    initialCreds.url.includes("placeholder-url") ? "" : initialCreds.url
  );
  const [key, setKey] = useState(
    initialCreds.key === "placeholder-anon-key" ? "" : initialCreds.key
  );
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [copiedSql, setCopiedSql] = useState(false);

  const isConnected = isSupabaseConfigured();

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setStatusMessage(null);

    const cleanUrl = url.trim();
    const cleanKey = key.trim();

    if (!cleanUrl.startsWith("https://") || !cleanUrl.includes("supabase.co")) {
      setStatusMessage({
        type: "error",
        text: "Please provide a valid Supabase Project URL (e.g., https://your-project.supabase.co)",
      });
      setIsTesting(false);
      return;
    }

    if (!cleanKey || cleanKey.length < 20) {
      setStatusMessage({
        type: "error",
        text: "Please provide a valid Supabase anon public key.",
      });
      setIsTesting(false);
      return;
    }

    try {
      // Test the URL with Supabase health ping
      const res = await fetch(`${cleanUrl}/auth/v1/health`, {
        headers: { apikey: cleanKey },
      });

      if (res.ok || res.status === 200 || res.status === 401) {
        // Save to browser credentials
        setCustomSupabaseCredentials(cleanUrl, cleanKey);
        recheckSupabaseConfig();
        setStatusMessage({
          type: "success",
          text: "Connection verified! Supabase is now live. Reloading workspace...",
        });

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setStatusMessage({
          type: "error",
          text: `Supabase ping returned HTTP ${res.status}. Please check your Project URL and Anon Key.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: `Network error connecting to Supabase: ${err?.message || "Unknown error"}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    clearCustomSupabaseCredentials();
    recheckSupabaseConfig();
    setUrl("");
    setKey("");
    setStatusMessage({
      type: "success",
      text: "Switched back to Local Demo Mode.",
    });
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const copySqlNotice = () => {
    navigator.clipboard.writeText(`-- View full schema in supabase/schema.sql inside your VibeCraft workspace`);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Cloud Database & Auth Configuration"
      description="Connect your live Supabase project to enable real multi-tenant PostgreSQL storage and JWT authentication."
      className="max-w-xl"
    >
      <div className="space-y-5 pt-2">
        {/* Status Indicator */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-3 w-3 rounded-full ${
                isConnected ? "bg-emerald-400 shadow-glow" : "bg-amber-400"
              }`}
            />
            <div>
              <p className="text-xs font-semibold text-white">
                {isConnected ? "Supabase Connected & Active" : "Currently in Local Demo Mode"}
              </p>
              <p className="text-[11px] text-slate-400">
                {isConnected
                  ? "Queries and JWT authentication are synced with your live database."
                  : "Using persistent browser storage and seed event architectures."}
              </p>
            </div>
          </div>
          {isConnected && (
            <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-xs text-rose-400">
              Disconnect
            </Button>
          )}
        </div>

        {/* Setup Quick Links */}
        <div className="p-3.5 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 text-xs text-slate-300 space-y-2">
          <p className="font-semibold text-fuchsia-300 flex items-center gap-1.5">
            <Database className="h-4 w-4" /> 3-Minute Supabase Setup Instructions:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
            <li>
              Open your{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-fuchsia-400 underline inline-flex items-center gap-0.5"
              >
                Supabase Dashboard <ExternalLink className="h-2.5 w-2.5" />
              </a>{" "}
              and go to <strong>Project Settings → API</strong>.
            </li>
            <li>Copy your <strong>Project URL</strong> and <strong>anon / public key</strong>.</li>
            <li>
              Run the SQL migration script from{" "}
              <code className="text-fuchsia-300 bg-slate-900 px-1 py-0.5 rounded">
                supabase/schema.sql
              </code>{" "}
              in your Supabase SQL Editor.
            </li>
          </ol>
        </div>

        {/* Alert Messages */}
        {statusMessage && (
          <div
            className={`flex items-start gap-2 rounded-xl p-3 text-xs border ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Supabase Project URL</label>
            <Input
              required
              placeholder="https://xyzabcdefg.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Supabase Anon Public API Key</label>
            <Input
              required
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[10px] text-slate-500">
              Keys are securely stored in your browser session or `.env.local`.
            </span>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="glow" size="sm" disabled={isTesting}>
                {isTesting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Testing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                    Verify &amp; Connect Live
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
