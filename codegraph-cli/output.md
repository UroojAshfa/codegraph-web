# Call Graph Visualization

```mermaid
graph TD
  AIService_constructor["AIService.constructor"]
  AIService_explainFunction["AIService.explainFunction"]
  AIService_analyzeComplexity["AIService.analyzeComplexity"]
  AIService_suggestRefactoring["AIService.suggestRefactoring"]
  AIService_detectCodeSmells["AIService.detectCodeSmells"]
  CodeAnalyzer_constructor["CodeAnalyzer.constructor"]
  CodeAnalyzer_findJSFiles["CodeAnalyzer.findJSFiles"]
  CodeAnalyzer_extractFunctions["CodeAnalyzer.extractFunctions"]
  visit["visit"]
  CodeAnalyzer_extractObjectMethods["CodeAnalyzer.extractObjectMethods"]
  CodeAnalyzer_extractCalls["CodeAnalyzer.extractCalls"]
  CodeAnalyzer_extractImportsExports["CodeAnalyzer.extractImportsExports"]
  CodeAnalyzer_analyzeFile["CodeAnalyzer.analyzeFile"]
  CodeAnalyzer_calculateComplexity["CodeAnalyzer.calculateComplexity"]
  CodeAnalyzer_analyzeDirectory["CodeAnalyzer.analyzeDirectory"]
  CodeAnalyzer_getFileCount["CodeAnalyzer.getFileCount"]
  CodeAnalyzer_getImports["CodeAnalyzer.getImports"]
  CodeAnalyzer_getExports["CodeAnalyzer.getExports"]
  CodeAnalyzer_getComplexity["CodeAnalyzer.getComplexity"]
  getGenerativeModel["getGenerativeModel (external)"]
  join["join (external)"]
  generateContent["generateContent (external)"]
  text["text (external)"]
  push["push (external)"]
  map["map (external)"]
  setLanguage["setLanguage (external)"]
  readdirSync["readdirSync (external)"]
  statSync["statSync (external)"]
  isDirectory["isDirectory (external)"]
  startsWith["startsWith (external)"]
  endsWith["endsWith (external)"]
  childForFieldName["childForFieldName (external)"]
  add["add (external)"]
  child["child (external)"]
  readFileSync["readFileSync (external)"]
  exec["exec (external)"]
  includes["includes (external)"]
  parse["parse (external)"]
  error["error (external)"]
  forEach["forEach (external)"]
  warn["warn (external)"]
  addNode["addNode (external)"]
  addEdge["addEdge (external)"]
  addDependency["addDependency (external)"]
  addComplexity["addComplexity (external)"]

  AIService_constructor --> getGenerativeModel
  AIService_explainFunction --> join
  AIService_explainFunction --> join
  AIService_explainFunction --> generateContent
  AIService_explainFunction --> text
  AIService_analyzeComplexity --> generateContent
  AIService_analyzeComplexity --> text
  AIService_suggestRefactoring --> generateContent
  AIService_suggestRefactoring --> text
  AIService_detectCodeSmells --> push
  AIService_detectCodeSmells --> push
  AIService_detectCodeSmells --> push
  AIService_detectCodeSmells --> join
  AIService_detectCodeSmells --> map
  AIService_detectCodeSmells --> generateContent
  AIService_detectCodeSmells --> push
  AIService_detectCodeSmells --> text
  CodeAnalyzer_constructor --> setLanguage
  CodeAnalyzer_constructor --> setLanguage
  CodeAnalyzer_findJSFiles --> readdirSync
  CodeAnalyzer_findJSFiles --> join
  CodeAnalyzer_findJSFiles --> statSync
  CodeAnalyzer_findJSFiles --> isDirectory
  CodeAnalyzer_findJSFiles --> startsWith
  CodeAnalyzer_findJSFiles --> push
  CodeAnalyzer_findJSFiles --> CodeAnalyzer_findJSFiles
  CodeAnalyzer_findJSFiles --> endsWith
  CodeAnalyzer_findJSFiles --> endsWith
  CodeAnalyzer_findJSFiles --> endsWith
  CodeAnalyzer_findJSFiles --> endsWith
  CodeAnalyzer_findJSFiles --> push
  visit --> childForFieldName
  visit --> push
  visit --> CodeAnalyzer_calculateComplexity
  visit --> childForFieldName
  visit --> childForFieldName
  visit --> add
  visit --> childForFieldName
  visit --> childForFieldName
  visit --> push
  visit --> CodeAnalyzer_calculateComplexity
  visit --> push
  visit --> CodeAnalyzer_calculateComplexity
  visit --> childForFieldName
  visit --> childForFieldName
  visit --> push
  visit --> CodeAnalyzer_calculateComplexity
  visit --> CodeAnalyzer_extractObjectMethods
  visit --> childForFieldName
  visit --> childForFieldName
  visit --> push
  visit --> childForFieldName
  visit --> CodeAnalyzer_calculateComplexity
  visit --> CodeAnalyzer_extractObjectMethods
  visit --> visit
  visit --> child
  CodeAnalyzer_extractFunctions --> visit
  CodeAnalyzer_extractObjectMethods --> child
  CodeAnalyzer_extractObjectMethods --> childForFieldName
  CodeAnalyzer_extractObjectMethods --> push
  CodeAnalyzer_extractObjectMethods --> childForFieldName
  CodeAnalyzer_extractObjectMethods --> CodeAnalyzer_calculateComplexity
  CodeAnalyzer_extractObjectMethods --> childForFieldName
  CodeAnalyzer_extractObjectMethods --> childForFieldName
  CodeAnalyzer_extractObjectMethods --> push
  CodeAnalyzer_extractObjectMethods --> CodeAnalyzer_calculateComplexity
  visit --> childForFieldName
  visit --> visit
  visit --> child
  visit --> childForFieldName
  visit --> visit
  visit --> child
  visit --> childForFieldName
  visit --> childForFieldName
  visit --> visit
  visit --> child
  visit --> childForFieldName
  visit --> visit
  visit --> child
  visit --> childForFieldName
  visit --> push
  visit --> childForFieldName
  visit --> childForFieldName
  visit --> push
  visit --> push
  visit --> visit
  visit --> child
  CodeAnalyzer_extractCalls --> visit
  CodeAnalyzer_extractImportsExports --> readFileSync
  CodeAnalyzer_extractImportsExports --> exec
  CodeAnalyzer_extractImportsExports --> startsWith
  CodeAnalyzer_extractImportsExports --> startsWith
  CodeAnalyzer_extractImportsExports --> push
  CodeAnalyzer_extractImportsExports --> exec
  CodeAnalyzer_extractImportsExports --> startsWith
  CodeAnalyzer_extractImportsExports --> startsWith
  CodeAnalyzer_extractImportsExports --> push
  CodeAnalyzer_extractImportsExports --> includes
  CodeAnalyzer_extractImportsExports --> exec
  CodeAnalyzer_extractImportsExports --> push
  CodeAnalyzer_extractImportsExports --> exec
  CodeAnalyzer_extractImportsExports --> push
  CodeAnalyzer_extractImportsExports --> includes
  CodeAnalyzer_extractImportsExports --> push
  CodeAnalyzer_extractImportsExports --> includes
  CodeAnalyzer_extractImportsExports --> includes
  CodeAnalyzer_extractImportsExports --> push
  CodeAnalyzer_extractImportsExports --> push
  CodeAnalyzer_extractImportsExports --> push
  CodeAnalyzer_analyzeFile --> readFileSync
  CodeAnalyzer_analyzeFile --> endsWith
  CodeAnalyzer_analyzeFile --> endsWith
  CodeAnalyzer_analyzeFile --> parse
  CodeAnalyzer_analyzeFile --> CodeAnalyzer_extractFunctions
  CodeAnalyzer_analyzeFile --> CodeAnalyzer_extractCalls
  CodeAnalyzer_analyzeFile --> CodeAnalyzer_extractImportsExports
  CodeAnalyzer_analyzeFile --> error
  CodeAnalyzer_calculateComplexity --> childForFieldName
  CodeAnalyzer_calculateComplexity --> child
  visit --> includes
  visit --> includes
  visit --> visit
  visit --> child
  CodeAnalyzer_calculateComplexity --> visit
  CodeAnalyzer_calculateComplexity --> push
  CodeAnalyzer_analyzeDirectory --> CodeAnalyzer_findJSFiles
  CodeAnalyzer_analyzeDirectory --> forEach
  CodeAnalyzer_analyzeDirectory --> CodeAnalyzer_analyzeFile
  CodeAnalyzer_analyzeDirectory --> forEach
  CodeAnalyzer_analyzeDirectory --> warn
  CodeAnalyzer_analyzeDirectory --> addNode
  CodeAnalyzer_analyzeDirectory --> forEach
  CodeAnalyzer_analyzeDirectory --> warn
  CodeAnalyzer_analyzeDirectory --> addEdge
  CodeAnalyzer_analyzeDirectory --> forEach
  CodeAnalyzer_analyzeDirectory --> forEach
  CodeAnalyzer_analyzeDirectory --> addDependency
  CodeAnalyzer_analyzeDirectory --> forEach
  CodeAnalyzer_analyzeDirectory --> addComplexity

```

View this diagram at: https://mermaid.live
