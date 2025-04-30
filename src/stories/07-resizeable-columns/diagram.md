on mount of the component call `table.fetchPages([1])` which calls `paginator.fetchPage(page)` for eaach page + visible pages in table.
Once all pages resolves they are returned back to the `table` which runs cursor validation on
existing visible page against received visible page. If cursor changed we will check if received pages contain all
new visible pages, if not then refetch visible pages against the cursor. We will repeat this process until we have
visible pages against the cursor. once we have them we will set scrollTop based on new cursor and set data in table

```mermaid

flowchart TD
  A[Component Mounts] --> B[Determine initial visible rows]
  B --> C[Fetch pages for visible rows]
  C --> D[Update table data and set scrollTop]
  D --> E[Check if cursor changed]

  E -- No change --> F[List for scroll events]
  F --> G[On scroll: determine new visible rows]
  G --> H[Fetch pages for new visible rows]
  H --> I[Update table data and set scrollTop]
  I --> E

  E -- Cursor changed --> J[Check if visible pages changed]
  J -- No change --> F
  J -- Pages changed --> K[Fetch new set of pages]
  K --> L[Update table data and set scrollTop]
  L --> E


```

UPdated

```mermaid
flowchart TD
  A["visibleRows change (scroll or resize)"] --> B["Compute visible pages"]
  B --> C["Fetch pages for visible pages"]
  C --> D["Update table data"]
  D --> E["Align scrollTop with cursor"]
  E --> F{"Cursor change affected visible pages?"}

  F -- No --> G["Wait for next visibleRows change"]
  G --> A

  F -- Yes --> H["Recompute visible pages after align"]
  H --> C
```
