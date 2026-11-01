import { normalizeSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/client";

describe("Supabase Client Utilities", () => {
  describe("normalizeSupabaseUrl", () => {
    it("strips /rest/v1 from URL", () => {
      const input = "https://ibcspikwlsivwsacqzpf.supabase.co/rest/v1";
      expect(normalizeSupabaseUrl(input)).toBe("https://ibcspikwlsivwsacqzpf.supabase.co");
    });

    it("strips /rest/v1/ with trailing slash", () => {
      const input = "https://ibcspikwlsivwsacqzpf.supabase.co/rest/v1/";
      expect(normalizeSupabaseUrl(input)).toBe("https://ibcspikwlsivwsacqzpf.supabase.co");
    });

    it("strips /auth/v1 and trailing slashes", () => {
      const input = "https://ibcspikwlsivwsacqzpf.supabase.co/auth/v1///";
      expect(normalizeSupabaseUrl(input)).toBe("https://ibcspikwlsivwsacqzpf.supabase.co");
    });

    it("trims whitespace from URLs", () => {
      const input = "   https://myproject.supabase.co/   ";
      expect(normalizeSupabaseUrl(input)).toBe("https://myproject.supabase.co");
    });

    it("returns empty string if rawUrl is falsy", () => {
      expect(normalizeSupabaseUrl("")).toBe("");
    });
  });

  describe("isSupabaseConfigured", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it("returns false when placeholder keys are used", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://placeholder-url.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "placeholder-anon-key";
      expect(isSupabaseConfigured()).toBe(false);
    });

    it("returns true when valid Supabase credentials exist", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://ibcspikwlsivwsacqzpf.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "valid-jwt-token-string";
      expect(isSupabaseConfigured()).toBe(true);
    });
  });
});
