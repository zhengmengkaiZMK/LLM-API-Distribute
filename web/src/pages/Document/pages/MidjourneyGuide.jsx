import React, { useContext } from 'react';
import { Typography, Divider } from '@douyinfe/semi-ui';
import CodeBlock from '../components/CodeBlock';
import InfoCard from '../components/InfoCard';
import { StatusContext } from '../../../context/Status';

const { Title, Paragraph, Text } = Typography;

const MidjourneyGuide = () => {
  const [statusState] = useContext(StatusContext);
  const serverAddress = statusState?.status?.server_address || window.location.origin;

  return (
    <div className="space-y-8">
      <div>
        <Title heading={2}>Midjourney 接口使用示例（局部重绘）</Title>
        <Paragraph className="mt-2 text-semi-color-text-2 text-lg">
          演示从文生图到局部重绘（Inpaint）的完整 API 调用流程。
        </Paragraph>
      </div>

      <Divider />

      <section>
        <Title heading={3}>环境准备</Title>
        <CodeBlock code="pip install requests pillow" language="bash" title="安装依赖" />
      </section>

      <section>
        <Title heading={3}>基础配置</Title>
        <CodeBlock
          code={`API_KEY = "sk-your-api-key"
BASE_URL = "${serverAddress}/mj"`}
          language="python"
          title="配置"
        />
      </section>

      <section>
        <Title heading={3}>完整操作流程</Title>
        <Paragraph className="mt-2 mb-4">
          以下示例演示了从文生图到局部重绘的完整 6 步流程：
        </Paragraph>

        <div className="space-y-6">
          <div>
            <Title heading={5}>第一步：提交文生图任务（Imagine）</Title>
            <CodeBlock
              code={`import requests

def _post(path, json_data):
    resp = requests.post(
        f"{BASE_URL}{path}",
        json=json_data,
        headers={"Authorization": f"Bearer {API_KEY}"}
    )
    return resp.json()

# 提交文生图
result = _post("/submit/imagine", {
    "prompt": "a cute steampunk cat, full body, high detail"
})
task_id = result["result"]
print(f"Task ID: {task_id}")`}
              language="python"
              title="提交 Imagine 任务"
            />
          </div>

          <div>
            <Title heading={5}>第二步：等待出图</Title>
            <CodeBlock
              code={`import time

def wait_task(task_id):
    while True:
        resp = requests.get(
            f"{BASE_URL}/task/{task_id}/fetch",
            headers={"Authorization": f"Bearer {API_KEY}"}
        )
        data = resp.json()
        if data["status"] == "SUCCESS":
            return data
        elif data["status"] == "FAILURE":
            raise Exception("任务失败")
        time.sleep(5)

task_data = wait_task(task_id)
image_url = task_data["imageUrl"]
print(f"图片地址: {image_url}")`}
              language="python"
              title="轮询任务状态"
            />
          </div>

          <div>
            <Title heading={5}>第三步：选图放大（Upscale）</Title>
            <CodeBlock
              code={`# 找到 U1 按钮
buttons = task_data["buttons"]
u1_btn = next(b for b in buttons if b["label"] == "U1")

# 点击 U1 放大
result = _post("/submit/action", {
    "taskId": task_id,
    "customId": u1_btn["customId"]
})
upscale_task_id = result["result"]
upscale_data = wait_task(upscale_task_id)`}
              language="python"
              title="Upscale 操作"
            />
          </div>

          <div>
            <Title heading={5}>第四步：触发局部重绘模式</Title>
            <CodeBlock
              code={`# 找到 Inpaint 按钮
inpaint_btn = next(b for b in upscale_data["buttons"] if "Inpaint" in b["label"])

# 触发模态框
result = _post("/submit/action", {
    "taskId": upscale_task_id,
    "customId": inpaint_btn["customId"]
})`}
              language="python"
              title="触发 Inpaint"
            />
          </div>

          <div>
            <Title heading={5}>第五步：生成蒙版</Title>
            <CodeBlock
              code={`from PIL import Image
import base64, io

# 下载原图
img = Image.open(requests.get(upscale_data["imageUrl"], stream=True).raw).convert("RGB")

# 创建蒙版（白色区域为重绘区域）
mask = Image.new("RGB", img.size, (0, 0, 0))
# 可绘制局部矩形蒙版
# from PIL import ImageDraw
# draw = ImageDraw.Draw(mask)
# draw.rectangle([100, 100, 400, 400], fill=(255, 255, 255))

buf = io.BytesIO()
mask.save(buf, format="PNG")
mask_base64 = base64.b64encode(buf.getvalue()).decode()`}
              language="python"
              title="生成蒙版"
            />
          </div>

          <div>
            <Title heading={5}>第六步：提交局部重绘</Title>
            <CodeBlock
              code={`result = _post("/submit/modal", {
    "taskId": upscale_task_id,
    "prompt": "a cute steampunk cat wearing futuristic VR goggles",
    "maskBase64": f"data:image/png;base64,{mask_base64}"
})
final_task_id = result["result"]
final_data = wait_task(final_task_id)
print(f"最终图片: {final_data['imageUrl']}")`}
              language="python"
              title="提交 Modal"
            />
          </div>
        </div>
      </section>

      <InfoCard type="info" title="提示">
        蒙版中白色区域表示需要重绘的部分，黑色区域保持不变。您可以使用 PIL 的 ImageDraw 模块绘制精确的蒙版区域。
      </InfoCard>
    </div>
  );
};

export default MidjourneyGuide;
