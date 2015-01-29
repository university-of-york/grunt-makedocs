---

title: Homepage
name: index
category: Components
layout: default
id: homepage

---

This is an example of how the documentation pages would work.

You can include an atomic component like so:

```js
<script>
component_docs("button");
</script>
```

And it will render both the HTML markup and the code to produce it, taken straight from the _components/button.html_ source.

<button class="btn">Click</button>
  
```html
<button class="btn">Click</button>
```

> **N.B. We will use the JS function `component` to add components to real pages**


To add additional information, pass parameters to the component call:

```js
<script>
component_docs("button", { "type": "warning", "text": "Help" });
</script>
```

This would render:

<button class="btn btn-warning">Help</button>

```html
<button class="btn btn-warning">Help</button>
```

More complex components (molecules) which combine atoms, will be pre-rendered from passed-through options.

```js
<script>
component_docs("button-group", {
	"buttons": [
		{ "text": "Back" }
		{ "type": "warning", "text": "Help", "icon-after": "help" }
		{ "text": "Next" }
	]
});
</script>
```

Rendering:

<div class="btn-group">
	<button class="btn">Back</button>
	<button class="btn btn-warning">Help <i class="icon icon-help"></i></button>
	<button class="btn">Next</button>
</div>

```html
<div class="btn-group">
	<button class="btn">Back</button>
	<button class="btn btn-warning">Help <i class="icon icon-help"></i></button>
	<button class="btn">Next</button>
</div>
```