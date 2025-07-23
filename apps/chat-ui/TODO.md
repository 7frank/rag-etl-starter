# TODO

## Agents config

Currently there is no way to import agents from yaml. There seems to be a PR though.

> https://github.com/danny-avila/LibreChat/pull/8306

- as a crude work around for the mean time we might can run the code below in the UI given we change the token and dont get a 401

```javascript
await fetch("http://localhost:3081/api/agents/agent_v53OZ6DRl1NUNjtDAmJDd", {
  credentials: "include",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
    "Content-Type": "application/json",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4N2Y5NGY5MmJkMTgwYWI3NzdhZjA4YiIsInVzZXJuYW1lIjoiYWFhYSIsInByb3ZpZGVyIjoibG9jYWwiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdC5kZSIsImlhdCI6MTc1MzI5NzkxOCwiZXhwIjoxNzUzMjk4ODE4fQ.qFXo86Ni2xNsmQnOTclUaVz1NRu2A5B40pfGsm25XF0",
    Priority: "u=0",
  },
  referrer: "http://localhost:3081/c/ece328ed-da18-4191-8c8a-a78433e3983b",
  body: '{"name":"Preconfigured MCP Agent 1","artifacts":"","description":"","instructions":"","model":"deepseek/deepseek-chat-v3-0324:free","tools":["memory","create_entities_mcp_memory","create_relations_mcp_memory","add_observations_mcp_memory","delete_entities_mcp_memory","delete_observations_mcp_memory","delete_relations_mcp_memory","read_graph_mcp_memory","search_nodes_mcp_memory","open_nodes_mcp_memory","playwright","browser_close_mcp_playwright","browser_resize_mcp_playwright","browser_console_messages_mcp_playwright","browser_handle_dialog_mcp_playwright","browser_evaluate_mcp_playwright","browser_file_upload_mcp_playwright","browser_install_mcp_playwright","browser_press_key_mcp_playwright","browser_type_mcp_playwright","browser_navigate_mcp_playwright","browser_navigate_back_mcp_playwright","browser_navigate_forward_mcp_playwright","browser_network_requests_mcp_playwright","browser_take_screenshot_mcp_playwright","browser_snapshot_mcp_playwright","browser_click_mcp_playwright","browser_drag_mcp_playwright","browser_hover_mcp_playwright","browser_select_option_mcp_playwright","browser_tab_list_mcp_playwright","browser_tab_new_mcp_playwright","browser_tab_select_mcp_playwright","browser_tab_close_mcp_playwright","browser_wait_for_mcp_playwright","wiki-knowledge","search_knowledge_mcp_wiki-knowledge","get_page_mcp_wiki-knowledge","search_by_topic_mcp_wiki-knowledge","get_stats_mcp_wiki-knowledge"],"provider":"OpenRouter Free","model_parameters":{},"agent_ids":[],"end_after_tools":false,"hide_sequential_outputs":false}',
  method: "PATCH",
  mode: "cors",
});
```
