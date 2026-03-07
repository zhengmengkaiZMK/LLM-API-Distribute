import React, { useContext } from 'react';
import { Typography, Divider } from '@douyinfe/semi-ui';
import APIEndpoint from '../components/APIEndpoint';
import { StatusContext } from '../../../context/Status';

const { Title, Paragraph } = Typography;

const ModelsAPI = () => {
  const [statusState] = useContext(StatusContext);
  const serverAddress = statusState?.status?.server_address || window.location.origin;

  return (
    <div className="space-y-8">
      <div>
        <Title heading={2}>Models（列出模型）</Title>
        <Paragraph className="mt-2 text-semi-color-text-2 text-lg">
          获取当前可用的所有模型列表。
        </Paragraph>
      </div>

      <Divider />

      <APIEndpoint
        method="GET"
        path="/v1/models"
        description="列出所有可用的 AI 模型。"
        headers={[
          {
            key: '1',
            name: 'Authorization',
            type: 'string',
            required: true,
            description: 'Bearer Token 认证，格式：Bearer {YOUR_API_KEY}',
          },
        ]}
        curlExample={`curl --location --request GET '${serverAddress}/v1/models' \\
--header 'Authorization: Bearer {YOUR_API_KEY}'`}
        responseExample={`{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      "created": 1686935002,
      "owned_by": "openai"
    },
    {
      "id": "claude-sonnet-4-5-20251022",
      "object": "model",
      "created": 1686935002,
      "owned_by": "anthropic"
    }
  ]
}`}
      />
    </div>
  );
};

export default ModelsAPI;
