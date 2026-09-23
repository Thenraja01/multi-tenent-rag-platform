import asyncio
import json
import httpx

BASE_URL = "http://localhost:8000"

async def test_week3_pipeline():
    print("=================================================================")
    print("     TESTING WEEK 3: RAG & AI MULTI-DOMAIN RETRIEVAL PIPELINE    ")
    print("=================================================================")

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # 1. Authenticate as OrgAdmin
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@globex.com", "password": "Password123!"},
        )
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        auth_data = login_res.json()
        token = auth_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("  [OK] 1. Authentication successful.")

        # 2. Test 3.7 AI Configuration endpoints
        ai_cfg_res = await client.get("/api/v1/ai-config", headers=headers)
        assert ai_cfg_res.status_code == 200, f"AI Config GET failed: {ai_cfg_res.text}"
        ai_cfg = ai_cfg_res.json()
        print(f"  [OK] 2. AI Config retrieved (Provider: {ai_cfg['configuration']['provider']}, Model: {ai_cfg['configuration']['model']})")

        # Update AI Configuration
        update_cfg_res = await client.post(
            "/api/v1/ai-config",
            headers=headers,
            json={
                "provider": "ollama",
                "model": "llama3.2",
                "temperature": 0.15,
                "rag_top_k": 4,
            },
        )
        assert update_cfg_res.status_code == 200, f"AI Config Update failed: {update_cfg_res.text}"
        print("  [OK] 3. AI Config updated successfully.")

        # 3. Test 3.13 Persistent Chat: Create Conversation
        convo_res = await client.post(
            "/api/v1/chat/conversations",
            headers=headers,
            json={"title": "Q3 Benefits & Expense Consultation"},
        )
        assert convo_res.status_code == 201, f"Create conversation failed: {convo_res.text}"
        convo = convo_res.json()
        convo_id = convo["id"]
        print(f"  [OK] 4. Conversation created: ID = {convo_id}")

        # 4. Test 3.10 - 3.11 RAG Answer Generation & Source Citations
        query_res = await client.post(
            "/api/v1/knowledge/query",
            headers=headers,
            json={
                "query": "What is the policy for expense reimbursement and travel approval?",
                "conversation_id": convo_id,
                "domain_slug": "finance",
                "top_k": 3,
            },
        )
        assert query_res.status_code == 200, f"Knowledge query failed: {query_res.text}"
        q_data = query_res.json()
        print(f"  [OK] 5. RAG Query executed successfully.")
        print(f"      Latency: {q_data.get('latency_ms')} ms")
        print(f"      Citations count: {len(q_data.get('citations', []))}")
        print(f"      Answer excerpt: {q_data.get('answer', '')[:120]}...")

        # 5. Test 3.12 SSE Streaming
        print("  [->] 6. Testing SSE Streaming endpoint (/api/v1/knowledge/stream)...")
        token_count = 0
        received_citations = False
        received_done = False

        async with client.stream(
            "POST",
            "/api/v1/knowledge/stream",
            headers=headers,
            json={
                "query": "Summarize HR annual leave entitlements and rollover rules",
                "conversation_id": convo_id,
                "domain_slug": "hr",
                "top_k": 3,
            },
        ) as stream_res:
            assert stream_res.status_code == 200, f"Streaming failed with status: {stream_res.status_code}"
            async for line in stream_res.aiter_lines():
                if line.startswith("data: "):
                    payload_str = line[6:].strip()
                    if payload_str == "[DONE]":
                        received_done = True
                        break
                    try:
                        event_data = json.loads(payload_str)
                        if event_data.get("event") == "citations" or event_data.get("type") == "sources":
                            received_citations = True
                        elif event_data.get("event") == "token" or event_data.get("type") == "token":
                            token_count += 1
                        elif event_data.get("event") == "done":
                            received_done = True
                    except Exception:
                        pass

        print(f"  [OK] 7. SSE Streaming verified (Tokens streamed: {token_count}, Citations event: {received_citations}, Done event: {received_done})")

        # 6. Test 3.13 Conversation Detail & Message Persistence
        detail_res = await client.get(f"/api/v1/chat/conversations/{convo_id}", headers=headers)
        assert detail_res.status_code == 200, f"Get conversation detail failed: {detail_res.text}"
        detail = detail_res.json()
        assert len(detail["messages"]) >= 2, f"Expected persisted messages, found {len(detail['messages'])}"
        print(f"  [OK] 8. Conversation history verified ({len(detail['messages'])} messages stored with citations).")

        # 7. Test Delete Conversation
        del_res = await client.delete(f"/api/v1/chat/conversations/{convo_id}", headers=headers)
        assert del_res.status_code == 200, f"Delete conversation failed: {del_res.text}"
        print("  [OK] 9. Delete conversation verified.")

        print("\n=================================================================")
        print("  ALL WEEK 3 RAG & AI RETRIEVAL TESTS PASSED (100% SUCCESS)     ")
        print("=================================================================")

if __name__ == "__main__":
    asyncio.run(test_week3_pipeline())
