---
description: Read and discuss a specific blog post
argument-hint: <slug>
---

The user wants to read and discuss the blog post: $ARGUMENTS

Available posts and their slugs:
- `dx` - On Developer Experience
- `developer-marketing` - On Developer Marketing
- `devrel` - On Developer Relations
- `devtools` - On Developer Products
- `moderation` - On Community Moderation
- `rust` - Rust is Eating JavaScript
- `product-engineers` - Product Engineers
- `stack` - My Stack
- `ai` - Understanding AI

Use the Read tool to read the post at `content/$ARGUMENTS/index.mdx`.

Then provide a thoughtful summary or discussion of the post. If the user asked a specific question about it, answer that. Otherwise, give a brief overview of the main points and offer to discuss further.

If the slug is invalid or not provided, list the available posts and ask which one they'd like to explore.
