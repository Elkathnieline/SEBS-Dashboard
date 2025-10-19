# **Mermaid Architecture Diagrams – Advanced Feature Guide**  
*(Based on Mermaid v11.1.0+ syntax documentation)*

This guide curates the essential and lesser-known capabilities of **Mermaid architecture diagrams**, designed to model cloud infrastructure, CI/CD pipelines, and system topology with clarity and precision.

---

## **1. Core Building Blocks**

Architecture diagrams in Mermaid consist of four primary elements:

- **Groups**: Logical containers for services (e.g., VPCs, environments)
- **Services**: Represent individual components (e.g., databases, servers)
- **Edges**: Connections showing data flow or dependencies
- **Junctions**: Routing points for complex edge branching

All diagrams begin with the keyword:
```mermaid
architecture-beta
```

> ⚠️ **Note**: This feature is currently in beta (`architecture-beta`). Syntax may evolve in future versions.

---

## **2. Groups: Structured Containment**

Groups organize related services visually and semantically.

### **Basic Syntax**
```mermaid
group {id}({icon})[{label}]
```

**Example**:
```mermaid
group public_api(cloud)[Public API]
```
- `public_api`: internal identifier (used in references)
- `cloud`: icon from built-in or Iconify library
- `[Public API]`: display label

### **Nested Groups**
Groups can be nested using the `in` clause:
```mermaid
group private_api(cloud)[Private API] in public_api
```
This places `private_api` inside the `public_api` group.

---

## **3. Services: Component Representation**

Services represent deployable units like VMs, containers, or managed resources.

### **Syntax**
```mermaid
service {id}({icon})[{label}] (in {parent_group_id})?
```

**Examples**:
```mermaid
service db(database)[User Database]
service web(server)[Web App] in public_api
```

- Icons default to: `cloud`, `database`, `disk`, `internet`, `server`
- Custom icons from [Iconify.design](https://iconify.design) are supported using `pack:icon-name` (e.g., `mdi:docker`)

---

## **4. Edges: Defining Relationships**

Edges illustrate communication, dependency, or data flow between services or groups.

### **Basic Edge**
```mermaid
db -- web
```

### **Directional Control with Sides**
Specify connection **sides** using `T` (top), `B` (bottom), `L` (left), `R` (right):
```mermaid
db:R --> L:web
```
- Edge exits **right** of `db`, enters **left** of `web`

### **Arrows**
- `-->` : arrowhead on right
- `<--` : arrowhead on left
- `<-->` : bidirectional
- `--` : no arrowheads

### **Edges from/into Groups**
Use the `{group}` modifier to connect at the **group boundary**:
```mermaid
web{group}:B --> T:cache{group}
```
This draws an edge from the bottom of the group containing `web` to the top of the group containing `cache`.

> 🔹 **Important**: You cannot reference a group ID directly (e.g., `public_api:R --> ...` is invalid). Use a service inside the group + `{group}` modifier.

---

## **5. Junctions: Multi-Path Routing**

Junctions act as invisible 4-way crosspoints for complex routing.

### **Syntax**
```mermaid
junction {id} (in {parent_group})?
```

**Example**:
```mermaid
junction j1
db:R --> L:j1
j1 --> R:web
j1 --> R:admin
```
Useful for fan-out or fan-in scenarios without introducing a visible node.

---

## **6. Icons & Customization**

### **Built-in Icons**
- `cloud`, `database`, `disk`, `internet`, `server`

### **Custom Icons (Iconify)**
After registering an icon pack (e.g., `mdi` for Material Design Icons):
```mermaid
service runner(mdi:git)[CI Runner]
```

> 💡 **Tip**: Over 200,000 icons available via [Iconify](https://iconify.design). Use format `pack:icon-name`.

---

## **7. Best Practices for AI-Generated Diagrams**

- **Prefer semantic grouping**: Group by environment (dev/staging/prod), network zone (public/private), or team ownership.
- **Use directional edges intentionally**: Align flow left-to-right or top-to-bottom for readability.
- **Leverage junctions** to avoid crossing lines in complex topologies.
- **Label clearly**: Use concise, domain-relevant names in `[labels]`.
- **Avoid over-nesting**: Limit group depth to 2–3 levels to maintain clarity.

---

## **Example: Full Architecture Diagram**

```mermaid
architecture-beta
  group vpc(cloud)[Production VPC]
  
  group frontend(cloud)[Frontend] in vpc
  group backend(cloud)[Backend] in vpc

  service web(server)[Web Server] in frontend
  service api(server)[API Gateway] in backend
  service db(database)[Main DB] in backend

  junction j1 in vpc

  web:R --> L:api
  api:B --> T:db
  web:B --> T:j1
  j1 --> B:monitoring(server)[Monitoring]
```

This diagram models a production VPC with frontend/backend separation, database dependency, and external monitoring.

---

By mastering these features, AI systems can generate **production-grade infrastructure diagrams** that are both technically accurate and visually intuitive—ideal for documentation, onboarding, and system design reviews.