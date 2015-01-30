---

title: Buttons
name: buttons
category: Components
layout: default
id: buttons

---

# Buttons

Buttons come in four different types and three different sizes. Usually a `button` element should be used, although an `a`, an `input[type=button]`, an `input[type=reset]` or an `input[type=submit]` could be used.

The simplest is just a plain button:

<script>
component("button", { "text": "Click me" }, true);
component("button-link", { "text": "Go here", "href": "http://google.com" }, true);
component("button-input", { "text": "Send" }, true);
component("button-reset", { "text": "Reset" }, true);
component("button-submit", { "text": "Submit" }, true);
</script>

Other types are _cancel_, _primary_ and _highlight_:

<script>
component("button", { "text": "Cancel", "type": "cancel" }, true);
component("button", { "text": "Click this!", "type": "primary" }, true);
component("button", { "text": "Or this", "type": "highlight" }, true);
</script>

You can define the size of the button too:

<script>
component("button", { "text": "Tiny button", "size": "tiny" }, true);
component("button", { "text": "Small button", "size": "small" }, true);
component("button", { "text": "Medium button", "size": "medium" }, true);
component("button", { "text": "Large button", "size": "large" }, true);
component("button", { "text": "Huge button", "size": "huge" }, true);
</script>

It's also easy to add an icon to a button, either at the front, the end, or both (which doesn't look good, so don't do it).

<script>
component("button", { "text": "Help", "icon-before": "help" }, true);
component("button", { "text": "Info", "icon-after": "info" }, true);
component("button", { "text": "Please don't", "icon-before": "mobile", "icon-after": "tick" }, true);
</script>

## Button groups

## Complete options

### Component names

* button
* button-link
* button-input
* button-submit

### Options

#### Required:
**text**: the text on the button

#### Optional:

**type**: one of _default_ (default), _cancel_, _primary_ and _highlight_

**size**: one of _tiny_, _small_, _medium_ (default), _large_ or _huge_

**icon-before**: the type of [icon](icons) to appear at the front of the button (doesn't work with input[type=submit] or input[type=button])

**icon-after**: the type of [icon](icons) to appear at the end of the button (doesn't work with input[type=submit] or input[type=button])

**href**: the URL to visit when clicked (only for button-link, defaults to "#")
