import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface JSONEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

export function JSONEditor({ value, onChange, readOnly = false, height = "400px" }: JSONEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && editorRef.current) {
      // 动态导入Monaco Editor
      import('monaco-editor').then((monaco) => {
        if (editorRef.current && !monacoRef.current) {
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
          });

          // 监听内容变化
          monacoRef.current.onDidChangeModelContent(() => {
            const currentValue = monacoRef.current.getValue();
            onChange(currentValue);
            
            // 验证JSON格式
            try {
              JSON.parse(currentValue);
              setIsValid(true);
              setErrorMessage('');
            } catch (error) {
              setIsValid(false);
              setErrorMessage(error instanceof Error ? error.message : 'JSON格式错误');
            }
          });

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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm text-gray-600">
            {isValid ? 'JSON格式正确' : 'JSON格式错误'}
          </span>
        </div>
        {!readOnly && (
          <button
            onClick={formatJSON}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            格式化
          </button>
        )}
      </div>
      
      {!isValid && errorMessage && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {errorMessage}
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