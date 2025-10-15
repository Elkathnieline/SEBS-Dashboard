# **Advanced Feature Guide for AI-Curated UML Sequence Diagrams**  
*(Focused on lesser-known, high-impact capabilities of SequenceDiagram.org)*

This documentation outlines nuanced and underutilized features of SequenceDiagram.org that empower the creation of expressive, precise, and professional UML sequence diagrams—without relying on basic functions like saving or opening files.

---

## **1. Rich Participant Customization**

### **Specialized Participant Types**
Beyond generic `participant`, leverage semantic UML stereotypes:
- `actor`: Human user (stick figure)
- `boundary`: System interface (e.g., UI)
- `control`: Controller or coordinator logic
- `entity`: Persistent data object
- `database`: Data store
- `rparticipant`: Rounded rectangle for stylistic distinction

These convey architectural roles at a glance .

### **Icon & Image Integration**
- Embed **Material Design** or **Font Awesome 6** icons directly:
  ```text
  fontawesome6solid f48e "++**Syringe**++" as Syringe #red
  materialdesignicons F1FF escalator
  ```
- Use **base64-encoded PNGs** (≤50KB) as participant avatars for domain-specific visuals.

### **Multi-line & Styled Names**
Use quotes to enable line breaks and inline styling:
```text
actor "<color:#green>Payment\nGateway</color>" as PG
participant "++**Auth\nService**++" as Auth
```

---

## **2. Advanced Message Semantics**

### **Non-Instantaneous Messages**
Model real-world latency or scheduled events:
```text
Client->(3)Server: delayed request
Server(3)<--Client: delayed response
```
Use `space -n` to visually reorder message arrival vs. send time:
```text
Client->(5)Server:first
space -6
Client->Server:second (arrives first)
```

### **Failure & Custom Arrowheads**
- **Failure messages** with `x`:
  ```text
  A-xB: connection timeout
  C(2)x--#redA: retry failed
  ```
- Combine **dashed lines**, **open arrowheads**, and **colors** via modifiers:
  ```text
  Alice-[#red;4]->Bob: critical sync
  Alice<<-[#blue;2]-Bob: async reply
  ```

---

## **3. Dynamic Layout & Annotation**

### **Bottom Participants**
Force all lifelines to render at the diagram bottom (useful for reports or fixed layouts):
```text
bottomparticipants
participant User
database DB
```

### **Overlay-Aware Scrolling**
While not a syntax feature, the **Participant Overlay On Scroll** (enabled by default) ensures readability in tall diagrams—AI should assume this behavior when generating long sequences.

### **Structured Grouping with Boxes**
Go beyond notes—use semantic containers:
- `box over A,B`: Standard grouping
- `abox over A,B`: Angular box (for alternative visual hierarchy)
- `rbox over A,B`: Rounded box (e.g., for subsystems)

Style with color and borders:
```text
box over Auth,DB #lightblue #green;2;dashed: Identity Verification
```

---

## **4. Precision Styling & Typography**

### **Inline Rich Text**
Use lightweight markup in any label:
- `++text++` → **bold**
- `//text//` → *italic*
- `<color:#hex>text</color>`
- `<size:N>text</size>`

Example:
```text
title <size:24><color:#violet>Order Fulfillment\nFlow</color></size>
```

### **Note & Box Styling**
Apply fills, borders, and dash patterns:
```text
note over User #yellow #orange;3;dashed: Validation failed
```
Format: `#fill_color #border_color;border_weight;border_style`

---

## **5. Composition Best Practices for AI**

- **Minimize visual noise**: Avoid overusing colors or icons unless they add semantic value .
- **Prefer explicit participant aliases** (`as X`) for clarity in complex diagrams .
- **Use non-instantaneous messages** to model timeouts, queues, or async workflows realistically .
- **Group related interactions** under styled `box` or `rbox` elements to denote phases (e.g., “Authentication”, “Data Fetch”) .

---

By leveraging these advanced features, an AI can generate sequence diagrams that are not only syntactically correct but also **architecturally insightful**, **visually scannable**, and **semantically rich**—aligning with professional UML modeling standards .