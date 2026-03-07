import React from 'react';
import { Tag, Table, Typography } from '@douyinfe/semi-ui';
import CodeBlock from './CodeBlock';

const { Title, Paragraph, Text } = Typography;

const MethodBadge = ({ method }) => {
  const colors = {
    GET: 'green',
    POST: 'blue',
    PUT: 'orange',
    DELETE: 'red',
  };
  return (
    <Tag size="large" color={colors[method] || 'grey'} className="!text-sm !font-bold font-mono !rounded-md !px-3 !py-1">
      {method}
    </Tag>
  );
};

const APIEndpoint = ({ method, path, description, headers, bodyParams, curlExample, responseExample }) => {
  return (
    <div className="space-y-6">
      {/* 端点信息 */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-semi-color-fill-0 border border-semi-color-border">
        <MethodBadge method={method} />
        <code className="text-base font-mono text-semi-color-text-0 font-semibold">{path}</code>
      </div>

      {description && (
        <Paragraph className="text-semi-color-text-1">{description}</Paragraph>
      )}

      {/* Header参数 */}
      {headers && headers.length > 0 && (
        <div>
          <Title heading={5} className="mb-3">Header 参数</Title>
          <Table
            dataSource={headers}
            columns={[
              { title: '参数名', dataIndex: 'name', render: (text) => <code className="text-semi-color-primary">{text}</code> },
              { title: '类型', dataIndex: 'type' },
              { title: '必填', dataIndex: 'required', render: (val) => val ? <Tag color="red" size="small">必填</Tag> : <Tag size="small">可选</Tag> },
              { title: '说明', dataIndex: 'description' },
            ]}
            pagination={false}
            size="small"
            bordered
          />
        </div>
      )}

      {/* Body参数 */}
      {bodyParams && bodyParams.length > 0 && (
        <div>
          <Title heading={5} className="mb-3">Body 参数</Title>
          <Table
            dataSource={bodyParams}
            columns={[
              { title: '参数名', dataIndex: 'name', render: (text) => <code className="text-semi-color-primary">{text}</code> },
              { title: '类型', dataIndex: 'type' },
              { title: '必填', dataIndex: 'required', render: (val) => val ? <Tag color="red" size="small">必填</Tag> : <Tag size="small">可选</Tag> },
              { title: '说明', dataIndex: 'description' },
            ]}
            pagination={false}
            size="small"
            bordered
          />
        </div>
      )}

      {/* cURL 示例 */}
      {curlExample && (
        <div>
          <Title heading={5} className="mb-3">请求示例</Title>
          <CodeBlock code={curlExample} language="bash" title="cURL" />
        </div>
      )}

      {/* 响应示例 */}
      {responseExample && (
        <div>
          <Title heading={5} className="mb-3">返回响应</Title>
          <CodeBlock code={responseExample} language="json" title="Response 200" />
        </div>
      )}
    </div>
  );
};

export default APIEndpoint;
