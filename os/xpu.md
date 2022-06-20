# [OS] xPU
> date - 2022.06.20  
> keyword - os, cpu, gpu, dpu, npu  
> processing unit에 대해 정리  

<br>

## CPU(Central Processing Unit)
* 중앙 처리 장치
* 모든 PC에 반드시 1개 이상의 CPU가 존재
* 다계층 캐시 구조 등 범용 계산을 효율적으로 실행하는 것에 초점을 둔 프로세서


<br>

## GPU(Graphic Processing Unit)
* 실시간 그래픽 처리하기 위한 장치
* 병렬 처리 기능으로 다양한 컴퓨팅 작업을 가속화하여 인공지능, 데이터 분석 등의 핵심 인프라로 사용
* AI 분야에서 연산이 핵심적으로 필요한 연산은 matrix convolution인데, 매우 많은 연산이 필요


<br>

## NPU(Neural Processing Unit)
* GPU에서 신경망에서 처리해야 하는 곱셈 연산을 나눠서 시키는 불편함과 자원의 낭비를 줄이거나, NPU 제작 업체가 필요한 사항을 추가 하는 등의 Neural Network Processing에 특화된 칩셋

<br>

### TPU(Tensor Processing Unit)
* Google에서 제작한 NPU 이름


<br>

## DPU(Data Processing Unit)
* 데이터 가속 처리기
* 데이터 중심 가속 컴퓨팅의 또 하나의 핵심 축이 될 것
* 고성능 network interface로 data parsing, data processing, data를 CPU, GPU로 효율적 전송 가능
* 프로그래밍 가능한 가속화 엔진으로 인공지능, 보안, 데이터 저장 등을 위한 애플리케이션 성능을 향상시킬 수 있다
* cloud는 scale out architecture를 가지는 경우가 많으므로 instance의 가치는 CPU, DPU의 성능 가치로 이루어질 가능성이 높다
* CPU, GPU, NPU, SSD 등 고속 디바이스 사이에서 데이터는 빠르게 처리하면서도 유지 비용과 전력 소모는 최소화할 수 있는 DPU의 역할이 필수적


<br><br>

> #### Reference
> * [CPU도 GPU도 아닌 DPU가 뭔지 아시나요?](https://blogs.nvidia.co.kr/2020/05/26/whats-a-dpu-data-processing-unit/)
> * [THE VALUE PROPOSITION FOR AMAZON’S GRAVITON3 SERVER CHIP](https://www.nextplatform.com/2022/05/24/the-value-proposition-for-amazons-graviton3-server-chip/)
> * [CPU GPU TPU NPU](https://voidint.com/2020/10/14/cpu-gpu-tpu-npu/)
> * [CPU vs NPU 구조 및 NPU 목적](https://voidint.com/2020/11/25/gpu-vs-npu-deeplearning-difference/)
