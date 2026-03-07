import React from 'react';
import { Typography, Divider, Table, Tag } from '@douyinfe/semi-ui';
import InfoCard from '../components/InfoCard';

const { Title, Paragraph, Text } = Typography;

const VideoParams = () => {
  return (
    <div className="space-y-8">
      <div>
        <Title heading={2}>VEO, SORA 接口参数信息汇总</Title>
        <Paragraph className="mt-2 text-semi-color-text-2 text-lg">
          视频生成模型的分辨率和时长参数支持情况汇总。
        </Paragraph>
      </div>

      <Divider />

      <section>
        <Title heading={3}>SORA-2（官方 API）</Title>
        <Table
          dataSource={[
            { key: '1', param: '分辨率', value: '720x1280, 1280x720' },
            { key: '2', param: '时长', value: '4s, 8s, 12s' },
          ]}
          columns={[
            { title: '参数', dataIndex: 'param', width: 120 },
            { title: '支持值', dataIndex: 'value' },
          ]}
          pagination={false}
          size="small"
          bordered
          className="mt-4"
        />
      </section>

      <section>
        <Title heading={3}>SORA-2-PRO（官方 API）</Title>
        <Table
          dataSource={[
            { key: '1', param: '分辨率', value: '720x1280, 1280x720, 1024x1792, 1792x1024' },
            { key: '2', param: '时长', value: '4s, 8s, 12s' },
          ]}
          columns={[
            { title: '参数', dataIndex: 'param', width: 120 },
            { title: '支持值', dataIndex: 'value' },
          ]}
          pagination={false}
          size="small"
          bordered
          className="mt-4"
        />
      </section>

      <section>
        <Title heading={3}>VEO3.1（逆向）</Title>
        <Table
          dataSource={[
            { key: '1', param: '分辨率', value: '720x1280, 1280x720（仅限异步接口）' },
            { key: '2', param: '时长', value: '8s' },
          ]}
          columns={[
            { title: '参数', dataIndex: 'param', width: 120 },
            { title: '支持值', dataIndex: 'value' },
          ]}
          pagination={false}
          size="small"
          bordered
          className="mt-4"
        />
        <InfoCard type="warning" title="注意">
          VEO3.1 仅支持异步接口，分辨率参数仅在异步接口中有效。
        </InfoCard>
      </section>
    </div>
  );
};

export default VideoParams;
