import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface JSONEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
  schema?: any; // JSON Schema for validation
  showSchemaValidation?: boolean;
}

// 默认的会员权限Schema
const defaultMemberSchema = {
  type: "object",
  properties: {
    features: {
      type: "array",
      items: { type: "string" },
      description: "可用功能列表"
    },
    limits: {
      type: "object",
      properties: {
        api_calls: {
          type: "number",
          description: "每月API调用次数限制"
        },
        storage: {
          type: "string",
          description: "存储空间限制"
        }
      },
      required: ["api_calls", "storage"]
    },
    restrictions: {
      type: "array",
      items: { type: "string" },
      description: "功能限制列表"
    }
  },
  required: ["features", "limits", "restrictions"]
};

export function JSONEditor({ 
  value, 
  onChange, 
  readOnly = false, 
  height = "400px",
  schema = defaultMemberSchema,
  showSchemaValidation = true
}: JSONEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [schemaErrors, setSchemaErrors] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && editorRef.current) {
      // 动态导入Monaco Editor
      import('monaco-editor').then((monaco) => {
        if (editorRef.current && !monacoRef.current) {
          // 配置JSON Schema
          if (schema && showSchemaValidation) {
            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
              validate: true,
              schemas: [{
                uri: "http://example.com/schema.json",
                fileMatch: ["*"],
                schema: schema
              }],
              allowComments: false,
              trailingCommas: "error"
            });
          }

          monacoRef.current = monaco.editor.create(editorRef.current, {
            value: value,
            language: 'json',
            theme: 'vs-light',
            readOnly: readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            folding: true,
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            insertSpaces: true,
            renderWhitespace: 'selection',
            guides: {
              indentation: true,
              bracketPairs: true,
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showClasses: true,
              showFunctions: true,
              showVariables: true,
              showConstants: true,
              showEnums: true,
              showEnumsMembers: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showWords: true,
              showUsers: true,
              showIssues: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true
            }
          });

          // 监听内容变化
          monacoRef.current.onDidChangeModelContent(() => {
            const currentValue = monacoRef.current.getValue();
            onChange(currentValue);
            
            // 验证JSON格式
            try {
              const parsed = JSON.parse(currentValue);
              setIsValid(true);
              setErrorMessage('');
              
              // Schema验证
              if (showSchemaValidation && schema) {
                const errors = validateSchema(parsed, schema);
                setSchemaErrors(errors);
              }
            } catch (error) {
              setIsValid(false);
              setErrorMessage(error instanceof Error ? error.message : 'JSON格式错误');
              setSchemaErrors([]);
            }
          });

          // 监听诊断信息变化
          if (showSchemaValidation) {
            monacoRef.current.onDidChangeModelDecorations(() => {
              const model = monacoRef.current.getModel();
              if (model) {
                const markers = monaco.editor.getModelMarkers({ resource: model.uri });
                const errors = markers
                  .filter(marker => marker.severity === monaco.MarkerSeverity.Error)
                  .map(marker => marker.message);
                setSchemaErrors(errors);
              }
            });
          }

          // 设置初始值
          monacoRef.current.setValue(value);
        }
      });
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
        monacoRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (monacoRef.current && value !== monacoRef.current.getValue()) {
      monacoRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  // 简单的Schema验证函数
  const validateSchema = (data: any, schema: any): string[] => {
    const errors: string[] = [];
    
    if (schema.type === 'object') {
      if (typeof data !== 'object' || data === null) {
        errors.push('数据必须是对象类型');
        return errors;
      }
      
      // 检查必需字段
      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in data)) {
            errors.push(`缺少必需字段: ${field}`);
          }
        }
      }
      
      // 检查属性
      if (schema.properties) {
        for (const [key, value] of Object.entries(data)) {
          if (schema.properties[key]) {
            const propSchema = schema.properties[key];
            const propErrors = validateSchema(value, propSchema);
            errors.push(...propErrors.map(err => `${key}: ${err}`));
          }
        }
      }
    } else if (schema.type === 'array') {
      if (!Array.isArray(data)) {
        errors.push('数据必须是数组类型');
        return errors;
      }
      
      if (schema.items) {
        for (let i = 0; i < data.length; i++) {
          const itemErrors = validateSchema(data[i], schema.items);
          errors.push(...itemErrors.map(err => `[${i}]: ${err}`));
        }
      }
    } else if (schema.type === 'string') {
      if (typeof data !== 'string') {
        errors.push('数据必须是字符串类型');
      }
    } else if (schema.type === 'number') {
      if (typeof data !== 'number') {
        errors.push('数据必须是数字类型');
      }
    }
    
    return errors;
  };

  const formatJSON = () => {
    if (monacoRef.current) {
      try {
        const parsed = JSON.parse(monacoRef.current.getValue());
        const formatted = JSON.stringify(parsed, null, 2);
        monacoRef.current.setValue(formatted);
        setIsValid(true);
        setErrorMessage('');
      } catch (error) {
        setIsValid(false);
        setErrorMessage('无法格式化，JSON格式错误');
      }
    }
  };

  const insertTemplate = () => {
    if (monacoRef.current) {
      const template = JSON.stringify({
        features: ["basic"],
        limits: {
          api_calls: 1000,
          storage: "1GB"
        },
        restrictions: []
      }, null, 2);
      monacoRef.current.setValue(template);
    }
  };

  const hasErrors = !isValid || schemaErrors.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!hasErrors ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm text-gray-600">
            {!hasErrors ? 'JSON格式正确' : 'JSON格式错误'}
          </span>
          {showSchemaValidation && schemaErrors.length > 0 && (
            <span className="text-sm text-orange-600">
              ({schemaErrors.length} 个Schema错误)
            </span>
          )}
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            <button
              onClick={insertTemplate}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              插入模板
            </button>
            <button
              onClick={formatJSON}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              格式化
            </button>
          </div>
        )}
      </div>
      
      {!isValid && errorMessage && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      
      {showSchemaValidation && schemaErrors.length > 0 && (
        <div className="p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium mb-1">Schema验证错误:</div>
              <ul className="list-disc list-inside space-y-1">
                {schemaErrors.slice(0, 3).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {schemaErrors.length > 3 && (
                  <li>... 还有 {schemaErrors.length - 3} 个错误</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div 
        ref={editorRef} 
        style={{ height, border: '1px solid #e5e7eb', borderRadius: '6px' }}
        className="font-mono"
      />
    </div>
  );
} 