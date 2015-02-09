# grunt-makedocs

> Create documentation for your design patterns whilst keeping your components completely separate. It uses Markdown for the page content and Mustache for the templates.

> N.B. Tests have not been set up for this plugin yet.
> It is a new plugin that is still being tweaked. Use it at your own risk.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-makedocs --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-makedocs');
```

## The "makedocs" task

### Overview
In your project's Gruntfile, add a section named `makedocs` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  makedocs: {
    options: {
      // Task-specific options go here.
    },
    files: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.nav
Type: `Boolean`
Default value: `false`

Pass through a function to build a navigation menu from the list of pages. The default is false, which does nothing. The function takes a single argument, which is the array of pages containing the details from the YAML front matter, plus a `dest` object (the URL the page will be built at) and a `content` object (the page content). A sample function would be:

```js
function(pages) {
  var navPage = "partials/nav.html";
  var output = '<ul>';
  pages.forEach(page, i) {
    output+= '<li><a href="'+page.dest+'">'+page.title+'</a></li>';
  }
  output+= '</ul>';
  grunt.file.write(navPage, output);
}
```

#### options.build
Type: `Boolean`
Default value: `false`

Passes a `build` value through to the templates, which can be used to include/omit things for a development/live environment. (Currently used to call minified versions of CSS etc.).

#### options.layoutsDir
Type: `String`
Default value: `'./layouts'`

The `layouts` directory holds Mustache templates for the pages to use. You can use any of the config that you set out in the YAML front matter. Simple!

#### options.partialsDir
Type: `String`
Default value: `'./partials'`

The `partials` directory holds Mustache partials. The `makedocs` task read this directory (and any subdirectories) and creates Mustache partials for use within your `layout` templates. Useful for including a common header, footer or menu.

#### options.componentsDir
Type: `String`
Default value: `'./components'`

Finally, the `components` directory. This pretty much mirrors my `sass` directory, as each of my `.scss` files usually maps on to a single component.

Each of the Mustache templates in here is the markup for a single component. For example, the markup for my buttons is:

```html
<button class="btn btn-TYPE btn-SIZE">BUTTON TEXT<i class="icon-ICON"></i></button>
```

I have a few different TYPES of buttons and a couple of different SIZEs, and there's an optional ICON that can go before or after the button text.

This is put in to a Mustache template as follows:

```mustache
<button class="btn{{#type}} btn-{{this}}{{/type}}{{#size}} btn-{{this}}{{/size}}">{{#icon-before}}<i class="icon-{{this}}"></i>{{/icon-before}}{{text}}{{#icon-after}}<i class="icon-{{this}}"></i>{{/icon-after}}</button>
```

When this is rendered on the page, you pass through an object with the _type_, _size_, _icon-before_ or _icon-after_ options, and the template returns clean, properly formatted HTML.

## Making Pages

Pages are the meat of the documentation. Add a .md file to the `pages` directory, add an introduction, describe how you work, what your favourite colour is, anything as long as it's relevant.

At the top of each Markdown page is a YAML front matter section.

```yaml
---

title: Homepage
name: index
category: Components
layout: default
id: homepage

---
```

The important thing to put in here is _layout_. This chooses which of the templates in the layout directory you want to use to render your page. If you leave it blank , it will look for one called `default.mustache`.

The `name` option will be the file name of your finished file. This allows you to call the page template whatever you like and give the completed file a sensible name. This is useful for ordering your pages, as the files are processed alphabetically.

The other options are passed to the Mustache template. In my example I'm using {{title}} as the page title and {{id}} as an `id` attribute on the `body` tag.

The script tags that call a component function is, so far, the way that I'm calling the individual components to the page.

## Atomic Design

Using the priciples of [atomic design](http://bradfrost.com/blog/post/atomic-web-design/), you can build up your components as separate entities and then combine them on the page.

### Usage Examples

#### Default Options
This is how my system is set up: I put the `layouts`, `partials` and `components` directories in a `src` directory, along with a `pages` directory. The Grunt task reads the whole `pages` directory to make the documentation in a new `docs` directory.

```js
grunt.initConfig({
  makedocs: {
    docs: {
      options: {
        layoutsDir: 'src/layouts',
        partialsDir: 'src/partials',
        componentsDir: 'src/components'
      },
      files: [
        {
          expand: true,
          cwd: 'src/pages',
          src: ['*.md'],
          dest: 'docs',
          ext: '.html'
        }
      ]
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
