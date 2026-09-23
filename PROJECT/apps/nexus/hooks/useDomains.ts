import { useState, useEffect } from "react";
import { domainsApi } from "@/lib/api/domains";
import { Domain } from "@/types/domain";

export function useDomains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    domainsApi
      .getPublicDomains()
      .then((data: Domain[]) => setDomains(data))
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return { domains, loading };
}
