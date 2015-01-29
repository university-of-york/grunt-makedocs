---

title: Buttons
name: buttons
category: Components
layout: default
id: homepage

---

# Buttons

Buttons come in four different types and three different sizes. Usually a `button` element should be used, although an `a`, an `input[type=button]` or an `input[type=submit]` could be used (call "button-link", "button-input" or "button-submit").

The simplest is just a plain button:

<script>
component_docs("button", { "text": "Click me" });
component_docs("button-link", { "text": "Go here", "href": "http://google.com" });
component_docs("button-input", { "text": "Send" });
component_docs("button-submit", { "text": "Submit" });
</script>

Other types are _cancel_, _primary_ and _highlight_:

<script>
component_docs("button", { "text": "Cancel", "type": "cancel" });
component_docs("button", { "text": "Click this!", "type": "primary" });
component_docs("button", { "text": "Or this", "type": "highlight" });
</script>

You can define the size of the button too:

<script>
component_docs("button", { "text": "Tiny button", "size": "tiny" });
component_docs("button", { "text": "Small button", "size": "small" });
component_docs("button", { "text": "Medium button", "size": "medium" });
component_docs("button", { "text": "Large button", "size": "large" });
component_docs("button", { "text": "Huge button", "size": "huge" });
</script>

It's also easy to add an icon to a button, either at the front, the end, or both (which doesn't look good, so don't do it).

<script>
component_docs("button", { "text": "Help", "icon-before": "help" });
component_docs("button", { "text": "Info", "icon-after": "info" });
component_docs("button", { "text": "Please don't", "icon-before": "mobile", "icon-after": "tick" });
</script>

## Button groups

## Complete options

### Component names:

* button
* button-link
* button-input
* button-submit

### Options:

## Required:
**text**: the text on the button

## Optional: 
**type**: one of _default_ (default), _cancel_, _primary_ and _highlight_
**size**: one of _tiny_, _small_, _medium_ (default), _large_ or _huge_
**icon-before**: the type of [icon](icons) to appear at the front of the button
**icon-after**: the type of [icon](icons) to appear at the end of the button
**href** (only for button-link): the URL to visit when clicked (defaults to "#").


```

 