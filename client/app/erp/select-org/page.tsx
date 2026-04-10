"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient, useERPAuth, ERPAuthProvider } from "@/src/components/erp/ERPAuthContext";

function SelectOrgPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setTokenAndUser } = useERPAuth();
  
  const selectionToken = searchParams.get("selection_token");

  useEffect(() => {
    if (!selectionToken) {
      router.push("/erp/login");
      return;
    }
    fetchAccounts();
  }, [selectionToken]);

  const fetchAccounts = async () => {
    try {
      const res = await apiClient.get("/api/erp/auth/accounts", {
        headers: { Authorization: `Bearer ${selectionToken}` }
      });
      setAccounts(res.data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
      router.push("/erp/login?error=session_expired");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (acc: any) => {
    try {
      // Use the selection token to get a real org-scoped token
      const res = await apiClient.post(`/api/erp/auth/switch/${acc.org_id}`, {}, {
        headers: { Authorization: `Bearer ${selectionToken}` }
      });
      const { access_token, user } = res.data;
      setTokenAndUser(access_token, user);
      router.push("/erp/dashboard");
    } catch (err) {
      console.error("Selection failed", err);
    }
  };

  const initials = (name: string) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  if (loading) return (
    <div style={{ height: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
      Gathering your workspaces...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px" }}>
      <img src="/images/logo2.png" alt="ERP" style={{ width: "48px", marginBottom: "40px", filter: "invert(1)" }} onError={e => e.currentTarget.style.display='none'} />
      <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>Who's using ERP?</h1>
      <p style={{ color: "#666", marginBottom: "48px" }}>Choose an organization to continue</p>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "center", maxWidth: "1000px" }}>
        {accounts.map(acc => (
          <div 
            key={acc.org_id} 
            onClick={() => handleSelect(acc)}
            className="profile-card"
            style={{
              width: "160px", padding: "24px", borderRadius: "16px", background: "#0a0a0a", border: "1px solid #1a1a1a",
              cursor: "pointer", transition: "all 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px"
            }}
          >
            <div style={{ 
              width: "80px", height: "80px", borderRadius: "20px", background: "linear-gradient(45deg, #111, #222)", 
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 800, color: "#fff", border: "1px solid #333"
            }}>
              {acc.avatar ? <img src={acc.avatar} alt={acc.org_name} style={{ width: "100%", height: "100%", borderRadius: "20px", objectFit: "cover" }} /> : initials(acc.org_name)}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "120px" }}>{acc.org_name}</div>
              <div style={{ color: "#444", fontSize: "12px", marginTop: "4px" }}>{acc.role}</div>
            </div>
          </div>
        ))}
        
        {/* Add Org Option */}
        <div 
          onClick={() => router.push("/erp/signup")}
          style={{
            width: "160px", padding: "24px", borderRadius: "16px", background: "transparent", border: "1px dashed #222",
            cursor: "pointer", transition: "all 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px"
          }}
        >
          <div style={{ 
            width: "80px", height: "80px", borderRadius: "20px", border: "1px dashed #333",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "#444"
          }}>+</div>
          <div style={{ color: "#444", fontWeight: 600, fontSize: "14px" }}>New Organization</div>
        </div>
      </div>

      <style jsx>{`
        .profile-card:hover { border-color: #fff; transform: translateY(-4px); }
        .profile-card:hover div { color: #fff; }
      `}</style>
    </div>
  );
}

export default function SelectOrgPageWrapper() {
  return (
    <ERPAuthProvider>
      <Suspense fallback={<div style={{ background: "#000", height: "100vh" }} />}>
        <SelectOrgPage />
      </Suspense>
    </ERPAuthProvider>
  );
}
