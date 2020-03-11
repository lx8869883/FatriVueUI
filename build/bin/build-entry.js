/**
 * Created by starlee on 2020/03/09.
 */
const Components = require('../../components.json')
const path = require('path')
const render = require('json-templater/string')
const uppercamelcase = require('uppercamelcase')
const endOfLine = require('os').EOL // 当前系统的行结束符号
const fileSave = require('file-save')

const OUTPUT_PATH = path.join(__dirname, '../../src/index.js') // 入口文件
const IMPORT_TEMPLATE = "import {{name}} from '../packages/{{package}}/index.js';" // 导入模板
const INSTALL_COMPONENT_TEMPLATE = '  {{name}}'
const MAIN_TEMPLATE = `/* Automatically generated by './build/bin/build-entry.js' */

{{include}}

const components = [
{{install}}
]

const install = (Vue, opts) => {
    components.forEach(component => {
        Vue.component(component.name, component)
    })
}

if(typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}

export default {
    version: '{{version}}',
    install,
    {{list}}
}`

const ComponentNames = Object.keys(Components)
const includeComponentTemplate = []
const installTemplate = []
const listTemplate = []

ComponentNames.forEach(name => {
  const componentName = uppercamelcase(name)

  includeComponentTemplate.push(
    render(IMPORT_TEMPLATE, {
      name: componentName,
      package: name
    })
  )

  installTemplate.push(
    render(INSTALL_COMPONENT_TEMPLATE, {
      name: componentName,
      componentName: name
    })
  )

  listTemplate.push(`  ${componentName}`)
})

const template = render(MAIN_TEMPLATE, {
  include: includeComponentTemplate.join(endOfLine),
  install: installTemplate.join(',' + endOfLine),
  version: process.env.VERSION || require('../../package.json').version,
  list: listTemplate.join(',' + endOfLine)
})

fileSave(OUTPUT_PATH)
  .write(template, 'utf-8')
  .end('\n')

console.log('[build entry] DONE:', OUTPUT_PATH)
