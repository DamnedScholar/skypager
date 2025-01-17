import runtime from '@skypager/web'

const { Feature } = runtime

export default class DomRenderer extends Feature {
  static shortcut = 'renderer'

  shortcut = 'renderer'

  async initialize() {
    await this.loadLibraries()
  }

  async loadLibraries() {
    const { assetLoader } = this.runtime
    const env = process.env.NODE_ENV
    const version = env === 'production' ? 'production.min' : 'development'

    const response = await assetLoader.unpkg({
      ReactDOM: `react-dom@16.7.0/umd/react-dom.${version}.js`,
      React: `react@16.7.0/umd/react.${version}.js`,
    })

    Object.assign(this, {
      React: response.React,
      ReactDOM: response.ReactDOM,
    })

    return response
  }

  async render(Component, ...args) {
    await this.loadLibraries()
    return this.renderSync(Component, ...args)
  }

  renderSync(Component, ...args) {
    const { rootId = 'root' } = this.get('settings', {})

    const el = args.pop() || document.getElementById(rootId)
    const props = args.length ? args.pop() : {}
    const { render } = this.ReactDOM
    const { isValidElement, createElement } = this.React

    if (isValidElement(Component)) {
      return render(Component, el)
    } else {
      return render(createElement(Component, props), el)
    }
  }
}
