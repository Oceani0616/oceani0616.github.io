---
layout:     post
title:      "Koheron Alpha-250 FPGA Manual"
subtitle:   "开发教程"
date:       2024-06-19 16:36:29
author:     "Oceani Cheng"
Comments:    true
header-img: "img/post_ka250/ALPHA250.jpg"
tags:
    - Alita
    - FPGA
    - Linux
---
# Koheron Alpha-250 FPGA 手册（完整版）珍藏版、周年纪念版、限量版等等

## 0. 为什么写这个

因为我们要做一个里德堡原子探头，需要用这玩意做光电信号采集处理终端。然而好像只有[官方参考文档](https://www.koheron.com/fpga/alpha250-signal-acquisition-generation)可以参考，没有其他任何包括CSDN什么的第三方资料。没事，俺可以根据官方文档和ChatGPT自己弄一个，就当是自己必须从头学起的笔记了。

## 1. 关于 Koheron Alpha-250 FPGA
**ALPHA-250**是围绕**Zynq 7020 SoC**构建的可编程板。**Zynq 7020 SoC**具有**100 MHz射频前端**，带有**14位ADC和16位DAC**，频率为**250 MSPS**。射频通道由一个**双PLL、超低抖动时钟发生器**锁时（clocked）。时钟发生器包括一个**4通道24位ADC**和一个**4通道16位DAC**。该板具有全面的开源FPGA/Linux参考设计。这个挺贵的：
![git](/img/post_ka250/price.png)
<p class="caption" > 一个要快3万啦。 </p>
相关名词：
- [**Zynq 7020 SoC**](https://www.amd.com/zh-cn/products/adaptive-socs-and-fpgas/soc/zynq-7000.html#tabs-652af54e61-item-2295ab1c75-tab)将一个**ARM处理器**和一个**FPGA（现场可编程门阵列）**集成在同一个芯片上，提供了强大的计算和信号处理能力。
  - 是**AMD**（AMD, yes!）公司生产的，带了双核 Cortex-A9 MPCore，ARM架构的，Up to 866MHz。
  - [这儿](https://docs.amd.com/v/u/en-US/zynq-7000-product-selection-guide)有详细的参数。不仔细研究了。
- 射频（RF）前端工作频率为**100 MHz**，意味着它能够处理高达**100 MHz**频率的信号。
  - **14-bit ADCs（模数转换器）**，将模拟信号转换为数字信号，14位的分辨率表示它可以将模拟信号量化为  $$2^{14} = 16,384$$  个不同的级别。
  - **16-bit DACs（数模转换器）**，将数字信号转换为模拟信号，16位的分辨率表示它可以将数字信号转换为 $$ 2^{16} = 65,536  $$个不同的电平。
  - 这两个转换器的采样速率为**250 MSPS**（每秒250百万次采样），表示它们每秒钟可以处理250百万个样本。
- RF通道由**双PLL（锁相环）**超低抖动时钟发生器提供时钟信号。抖动是指信号周期之间的微小变化，低抖动时钟可以提高系统的精度和稳定性。
- 除了RF前端的14位ADC和16位DAC外，板子还包括：
  - **4 通道 24-bit ADC**：更高分辨率的模数转换器，适用于需要高精度信号处理的应用。
  - **4 通道 16-bit DAC**：用于高精度的数模转换。

### 1.1 FPGA 简介
#### 1.1.1 **ASIC（专用集成电路）** [click](https://m.huxiu.com/article/2510954.html)
**ASIC（Application Specific Integrated Circuit，专用集成电路）**起步于上世纪70-80年代。早期的时候，曾用于计算机。后来，主要用于嵌入式控制。
这几年开始崛起，用于AI推理、高速搜索以及视觉和图像处理等。
为啥这几年崛起？进入21世纪后，算力需求呈现两个显著趋势：
- 一，算力的使用场景，开始细分；
- 二，用户对算力性能的要求，越来越高。通用的算力芯片，已经无法满足用户的需求。

<br>
<br>
于是，越来越多的企业，开始加强对专用计算芯片的研究和投资力度。而ASIC，就是一种专用于特定任务的芯片。<br><br>
ASIC的官方定义是指：应特定用户的要求，或特定电子系统的需要，专门设计、制造的集成电路。<br><br>
说到ASIC，我们就不得不提到Google公司大名鼎鼎的TPU。**TPU，全称Tensor Processing Unit**，张量处理单元。<br><br>
目前，几乎所有的机器学习系统，都使用张量作为基本数据结构。所以，张量处理单元，我们可以简单理解为“AI处理单元”。<br><br>
2015年，为了更好地完成自己的深度学习任务，提升AI算力，Google推出了一款专门用于神经网络训练的芯片，也就是TPU v1。<br><br>
相比传统的CPU和GPU，在神经网络计算方面，TPU v1可以获得15~30倍的性能提升，能效提升更是达到30~80倍，给行业带来了很大震动。<br><br>
2017年和2018年，Google又再接再励，推出了能力更强的TPU v2和TPU v3，用于AI训练和推理。2021年他们推出了TPU v4，采用7nm工艺，晶体管数达到220亿，性能相较上代提升了10倍，比英伟达的A100还强1.7倍。<br><br>
除了Google之外，还有很多大厂这几年也在捣鼓ASIC。<br><br>
英特尔公司在2019年底收购了以色列AI芯片公司Habana Labs，2022年发布了Gaudi 2 ASIC芯片。IBM研究院则于2022年底发布了AI ASIC芯片AIU。<br><br>
三星早几年也搞过ASIC，当时做的是矿机专用芯片。没错，很多人认识ASIC，就是从比特币挖矿开始的。相比GPU和CPU挖矿，ASIC矿机的效率更高，能耗更低。<br><br>
除了TPU和矿机之外，另外两类很有名的ASIC芯片，是**DPU**和**NPU**。<br><br>
DPU是数据处理单元（Data Processing Unit），主要用于数据中心。详见后面章节。<br><br>
NPU叫做神经网络处理单元（Neural Processing Unit），在电路层模拟人类神经元和突触，并用深度学习指令集处理数据。NPU专门用于神经网络推理，能够实现高效的卷积、池化等操作。一些手机芯片里，经常集成这玩意。说到手机芯片，值得一提的是，我们手机现在的主芯片，也就是常说的SoC芯片，其实也是一种ASIC芯片。<br><br>
ASIC芯片是基于芯片所面向的专项任务，芯片的计算能力和计算效率都是严格匹配于任务算法的。芯片的核心数量，逻辑计算单元和控制单元比例，以及缓存等，整个芯片架构，也是精确定制的。<br><br>
所以，定制专用芯片ASIC，可以实现极致的体积、功耗。这类芯片的可靠性、保密性、算力、能效，都会比通用芯片（CPU、GPU）更强。<br><br>
大家会发现，前面我们提到的几家ASIC公司，都是Google、英特尔、IBM、三星这样的大厂。<br><br>
这是因为，对芯片进行定制设计，对一家企业的研发技术水平要求极高，且耗资极为巨大。<br><br>
做一款ASIC芯片，首先要经过代码设计、综合、后端等复杂的设计流程，再经过几个月的生产加工以及封装测试，才能拿到芯片来搭建系统。<br><br>
大家都听说过“**流片（Tape-out）**”。像流水线一样，通过一系列工艺步骤制造芯片，就是流片。简单来说，就是试生产。<br><br>
ASIC的研发过程是需要流片的。14nm工艺，流片一次需要300万美元左右。5nm工艺，更是高达4725万美元。<br><br>
流片一旦失败，钱全部打水漂，还耽误了大量的时间和精力。一般的小公司，根本玩不起。<br><br>
那么，是不是小公司就无法进行芯片定制了呢？<br><br>
当然不是。接下来，就轮到主角神器出场了，那就是FPGA。<br><br>

#### 1.1.2 FPGA 简介
**现场可编程门阵列（Field-Programmable Gate Array，FPGA）**是一种半导体器件，具有高密度的可编程逻辑块和可配置的连线网络，用户可以根据需求进行编程和配置。
FPGA这些年在行业里很火，势头比ASIC还猛，甚至被人称为“万能芯片”。其实，简单来说，FPGA就是可以重构的芯片。它可以根据用户的需要，在制造后，进行无限次数的重复编程，以实现想要的数字逻辑功能。
之所以FPGA可以实现DIY，是因为其独特的**架构**。
FPGA由**可编程逻辑块（Configurable Logic Blocks，CLB）**、**输入/输出模块（I/O Blocks，IOB**）、**可编程互连资源（Programmable Interconnect Resources，PIR）**等三种可编程电路，以及**静态存储器SRAM**共同组成。
![git](/img/post_ka250/fpga_config.png)
<p class="caption" > FPGA的基本构造：CLB+IOB+PIR+SRAM </p>

- **CLB**是FPGA中最重要的部分，是实现逻辑功能的基本单元，承载主要的电路功能。它们通常规则排列成一个阵列（逻辑单元阵列，LCA，Logic Cell Array），散布于整个芯片中。
   - **CLB**本身，又主要由**查找表（Look-Up Table，LUT）**、**多路复用器（Multiplexer）**和**触发器（Flip-Flop）**构成。它们用于承载电路中的一个个逻辑“门”，可以用来实现复杂的逻辑功能。
   - 简单来说，我们可以把**LUT**理解为存储了计算结果的**RAM**。当用户描述了一个逻辑电路后，软件会计算所有可能的结果，并写入这个RAM。每一个信号进行逻辑运算，就等于输入一个地址，进行查表。LUT会找出地址对应的内容，返回结果。这种**“硬件化”的运算方式**，显然具有更快的运算速度。用户使用FPGA时，可以通过硬件描述语言（Verilog或VHDL），完成的电路设计，然后对FPGA进行“编程”（烧写），将设计加载到FPGA上，实现对应的功能。
   - 加电时，FPGA将EPROM（可擦编程只读存储器）中的数据读入SRAM中，配置完成后，FPGA进入工作状态。掉电后，FPGA恢复成白片，内部逻辑关系消失。如此反复，就实现了“现场”定制。
   - FPGA的功能非常强大。理论上，如果FPGA提供的门电路规模足够大，通过编程，就能够实现任意ASIC的逻辑功能

- **IOB**主要完成芯片上的逻辑与外部引脚的接口，通常排列在芯片的四周。

- **PIR**提供了丰富的连线资源，包括**纵横网状连线**、**可编程开关矩阵**和**可编程连接点**等。它们实现连接的作用，构成特定功能的电路。

- **静态存储器SRAM**，用于存放内部IOB、CLB和PIR的编程数据，并形成对它们的控制，从而完成系统逻辑功能。

**FPGA的发展历程：**
- 1985年，发明者是**Xilinx公司（赛灵思）**。后来，Altera（阿尔特拉）、Lattice（莱迪思）、Microsemi（美高森美）等公司也参与到FPGA这个领域，并最终形成了四巨头的格局。
- FPGA是在PAL（可编程阵列逻辑）、GAL（通用阵列逻辑）等可编程器件的基础上发展起来的产物，属于一种半定制电路。
- 2015年5月，英特尔以167亿美元的天价收购了Altera，后来收编为PSG（可编程解决方案事业部）部门。
   - 2023年10月，英特尔宣布计划拆分PSG部门，业务独立运营。
- 2020年，英特尔的竞争对手AMD也不甘示弱，以**350亿美元**收购了Xilinx。
   - Xilinx is now part of AMD. Each of us at AMD has the freedom to collaborate to create new ideas and possibilities. We break barriers because we ignore hierarchies. We shape the future because we believe ideas can come from anywhere. And we do it for our people, our customers and the world around us, every day. Join us!
- 国内FPGA厂商的包括复旦微电、紫光国微、安路科技、东土科技、高云半导体、京微齐力、京微雅格、智多晶、遨格芯等。看上去数量不少，但实际上技术差距很大。

**FPGA和ASIC的区别：**
- ASIC就是**用模具来做玩具**。事先要进行开模，比较费事。而且，一旦开模之后，就没办法修改了。如果要做新玩具，就必须重新开模。
- FPGA就像用**乐高积木来搭玩具**。上手就能搭，花一点时间，就可以搭好。如果不满意，或者想搭新玩具，可以拆开，重新搭。
- ASIC与FPGA的很多设计工具是相同的。在设计流程上，FPGA没有ASIC那么复杂，去掉了一些制造过程和额外的设计验证步骤，大概只有ASIC流程的50-70%。最头大的**流片过程**，FPGA是不需要的。
- FPGA可以在实验室或现场进行预制和编程，不需要**一次性工程费用（NRE）**。但是，作为“**通用玩具**”，它的成本是ASIC（压模玩具）的10倍。
- 所以， FGPA单片成本高，少量使用优先选择FGPA。ASIC开模成本高，大量使用才会选择ASIC。
![git](/img/post_ka250/fpgavsasic.jpeg)
<p class="caption" > 40万片是个临界点。 </p>
- FPGA是通用可编辑的芯片，**冗余功能**比较多。不管你怎么设计，都会多出来一些部件。ASIC是**贴身定制**，没什么浪费，且采用**硬连线**。所以，性能更强，功耗更低。
- FPGA现在多用于**产品原型的开发**、设计迭代，以及一些低产量的特定应用。它适合那些开发周期必须短的产品。FPGA还经常用于ASIC的验证。
- ASIC用于设计规模大、复杂度高的芯片，或者是成熟度高、产量比较大的产品。
- FPGA的主要应用领域是**通信、国防、航空、数据中心、医疗、汽车及消费电子**。汽车和工业领域，主要是看重了**FPGA的超低时延优势**，所以会用在ADAS（高级驾驶辅助系统）和伺服电机驱动上。
- FPGA在通信领域应用得很早。很多基站的处理芯片（基带处理、波束赋形、天线收发器等），都是用的FPGA。核心网的编码和协议加速等，也用到它。数据中心之前在DPU等部件上也用FPGA。后来，很多技术成熟了、定型了，通信设备商们就开始用ASIC替代，以此减少成本。消费电子用FPGA，是因为产品迭代太快。ASIC的开发周期太长了，等做出东西来，黄花菜都凉了。

**FPGA、ASIC、GPU，谁是最合适的AI芯片？**

1. **性能**：FPGA/ASIC最强
单纯从理论和架构的角度，ASIC和FPGA的性能和成本，肯定是优于CPU和GPU的。
CPU、GPU遵循的是**冯·诺依曼架构**，指令要经过**存储、译码、执行**等步骤，共享内存在使用时，要经历**仲裁和缓存**。
而FPGA和ASIC是**哈佛架构**。以FPGA为例，它本质上是无指令、无需共享内存的体系结构。FPGA的**逻辑单元功能**在编程时已确定，属于用**硬件来实现软件算**法。对于保存状态的需求，FPGA中的寄存器和片上内存（BRAM）属于各自的控制逻辑，不需要仲裁和缓存。从ALU运算单元占比来看，GPU比CPU高，FPGA因为几乎没有控制模块，所有模块都是ALU运算单元，比GPU更高。综合各个角度，FPGA的运算速度会比GPU更快。

1. **功耗**：FPGA/ASIC最强
GPU的功耗，是出了名的高，单片可以达到250W，甚至**450W（RTX4090）**。而FPGA一般只有**30~50W**。
这主要是因为内存读取。GPU的内存接口（GDDR5、HBM、HBM2、NVLink）**带宽极高**，大约是FPGA传统DDR接口的4-5倍（NVLink是20倍）。但就芯片本身来说，读取DRAM所消耗的能量，是SRAM的100倍以上。**GPU频繁读取DRAM的处理，产生了极高的功耗**。
另外，FPGA的**工作主频**（500MHz以下）比CPU、GPU（1~3GHz）低，也会使得自身功耗更低。FPGA的工作主频低，主要是受**布线资源**的限制。有些线要绕远，时钟频率高了，就来不及。

1. **时延**：FPGA/ASIC最强
GPU通常需要将不同的训练样本，划分成固定大小的“Batch（批次）”，为了最大化达到并行性，需要将数个Batch都集齐，再统一进行处理。
FPGA的架构，是**无批次（Batch-less）**的。每处理完成一个数据包，就能马上输出，时延更有优势。

那么，GPU这里那里都不如FPGA和ASIC，为什么还会成为现在AI计算的大热门呢？

很简单，在对算力性能和规模的极致追求下，现在整个行业根本不在乎什么成本和功耗。

在NVidia的长期努力下，GPU的核心数和工作频率一直在提升，芯片面积也越来越大，属于硬刚算力。**功耗靠工艺制程**，靠水冷等被动散热，反而不着火就行。

英伟达在**软件和生态**方面很会布局。CUDA是GPU的一个核心竞争力。基于CUDA，初学者都可以很快上手，进行GPU的开发。他们苦心经营多年，也形成了群众基础。

相比之下，FPGA和ASIC的开发还是太过复杂，不适合普及。

在**接口方面**，虽然GPU的接口比较单一（主要是PCIe），没有FPGA灵活（FPGA的可编程性，使其能轻松对接任何的标准和非标准接口），但对于服务器来说，足够了，插上就能用。

除了FPGA之外，ASIC之所以在AI上干不过GPU，和它的高昂成本、超长开发周期、巨大开发风险有很大关系。现在AI算法变化很快，ASIC这种开发周期，很要命。

综合上述原因，GPU才有了现在的大好局面。

在AI训练上，GPU的算力强劲，可以大幅提升效率。

在AI推理上，输入一般是单个对象（图像），所以要求要低一点，也不需要什么并行，所以GPU的算力优势没那么明显。很多企业，就会开始采用更便宜、更省电的FPGA或ASIC，进行计算。

其它一些算力场景，也是如此。看重算力绝对性能的，首选GPU。算力性能要求不那么高的，可以考虑FPGA或ASIC，能省则省。

例如，不同算力芯片进行混搭，互相利用优势，叫做**异构计算**。另外，还有**IBM带头搞的类脑芯片**，类似于大脑的神经突触，模拟人脑的处理过程，也获得了突破，热度攀升。

#### 1.1.3 DPU[click](https://mp.weixin.qq.com/s/qzr1yk9oLD98fjamoTt1jA)

### 1.2 Alpha-250 FPGA 架构简介
![git](/img/post_ka250/ALPHA250_connectors.png)
<p class="caption" > ALPHA250 </p>
![git](/img/post_ka250/ALPHA250-4_connectors.png)
<p class="caption" > ALPHA250-4  </p>
ALPHA250-4 的**采样率**是 ALPHA250 的两倍，为**250 MSPS**，相比之下 ALPHA250 的采样率为**125 MSPS**。另外，ALPHA250-4 的**模拟带宽是100 MHz**，而 ALPHA250 的**模拟带宽是50 MHz**。 由于采样率和带宽的提升，ALPHA250-4 更适合需要处理**更高频率信号**的应用。

- **12 V外部电源**
   -  外部电源连接器是一个插孔，具有1.95毫米的中心引脚和6毫米的外径。
   -此连接器上只能提供**12V**。运行ALPHA250至少需要**1A**。根据扩展连接器的负载，可能需要更多的电流。**最大电流为3A**（由保险丝保护）。
- **USB 2.0**
   - 它在**5V**下提供**1A**的电流（与膨胀连接器的5V电源共享）。电源和数据引脚受到ESD保护。
   - > 电源和数据引脚是ESD（静电放电）保护的，可以防止静电引起的短路和设备损坏。
- **Micro USB 2.0**
   - **Micro USB 2.0**连接与**`UART0` PS**核心通过**FTDI设备**连接，这通常用于调试串行接口。电源和数据引脚受到ESD保护。
   - > **FTDI设备**是一个USB到串行转换器，它允许USB接口与UART接口进行通信。常见的FTDI设备型号有FT232R、FT232H等。通过这种设备，可以在电脑上通过USB端口与开发板进行串行通信。
   - > `UART0` PS（Processor System）核心是Zynq处理器中的一个串行通信接口。它允许处理器通过串口与外部设备通信，通常用于调试和控制。
   - > 在这种配置下，Micro USB 2.0接口通过FTDI设备连接到Zynq的`UART0` PS核心，然后可以使用串口终端程序（如gtkterm或Tera Term）连接到开发板，进行调试和控制。
- **千兆以太网**：ALPHA250能够使用10/100/1000 Mbit以太网。
- **Micro SD卡**：Micro SD card 通过一个电平转换器（level-shifter）连接到 `SD0` PS 核心. The SD card I/Os are ESD protected.
   - >`SD0` PS 核心指Zynq处理器系统（Processor System, PS）中的第一个SD控制器（SD0）。SD控制器用于与SD卡进行数据传输。
   - > **电平转换器（level-shifter）**：Zynq处理器的**I/O电压为1.8V或3.3V**，而MicroSD卡工作在**3.3V电压**下。电平转换器的作用是将处理器的I/O电平转换为SD卡所需的电平，确保两者能够正常通信。另外，电平转换器还可以提供一定的电气隔离，保护处理器和SD卡免受电压不匹配带来的潜在损害。
   - 可以使用Linux命令如`lsblk`或`dmesg`查看SD卡的挂载情况。
   - 在Linux系统中挂载SD卡:
     ```sh
     sudo mount /dev/mmcblk0p1 /mnt/sdcard
     ```
   - 弹出SD卡：
    ```sh
     sudo umount /mnt/sdcard
     ```
- **扩展连接器**
  ![git](/img/post_ka250/a250_expansion-connector.png)
  <p class="caption" > ALPHA250-4的不同就是右下角倒数第三个 VCCIO_3V3 改成了 VCCIO_1V8. </p>
  太复杂了，先不研究。[Mark在这里](https://www.koheron.com/support/user-guides/alpha250/#expansion-connector)。
### 1.3 Alpha-250 FPGA 子系统
#### 1.3.1 射频ADC
射频ADC有2个采集通道，具有14位分辨率和250 Msps最大采样率（使用的是Linear Technologies的[LTC2157-14 ADC芯片](https://www.analog.com/media/en/technical-documentation/data-sheets/21576514fb.pdf)）。
它在SMA连接器上有两个标有IN0和IN1的输入。
- 输入是**直流耦合**的（输入信号可以包含直流（0 Hz）分量）
- 有**50欧姆的终端匹配**。为了达到最佳的DC偏置，输入信号应来自**50Ω输出阻抗源**。这样可以确保信号被正确地传输到ADC。
- 输入信号的峰值-峰值电压范围是1 Vpp（峰-峰值），即信号在-500 mV到500 mV之间，ADC能够正确采集和转换输入电压在这个范围内的信号。
- 输入端口配有瞬态电压抑制器（TVS），TVS会钳制超过±8 V的电压，防止输入信号过高导致ADC损坏。
- 总的流程：
   - 连接信号源：将你的信号源通过SMA连接器连接到IN0或IN1输入端口。
   - 匹配阻抗：确保信号源的输出阻抗为50 Ω，以优化信号传输和DC偏置。
   - 信号范围：确认信号的峰-峰值范围在1 Vpp（-500 mV到500 mV）内。
![a250_rf-adc](/img/post_ka250/a250_rf-adc.png)
<p class="caption" > a250的射频-adc  </p>



## 2. 操作指南
### 2.1 开机
首先，将micro-SD卡插入micro-SD插槽。然后连接电源的12V插孔。绿色LED（PWGD）说明通电了，橙色LED（DONE）说明FPGA完成啦。反正表示系统已正确启动。
### 2.2 连接板子
#### 2.2.1 LAN
和板子连接最主要的方法就是**以太网接口**，就是插网线。
#### 2.2.2 直接连电脑 
从[here](https://www.koheron.com/support/tutorials/setup-direct-ethernet-static-ip/)抄的。
首先得给 Zynq 板子分配好 静态IP地址。静态IP地址确保每次设备重启或连接时，其IP地址保持不变，对于设备之间的直接通信特别重要，因为IP地址不会改变，通信双方可以始终知道如何找到对方。
？？？部分讲了怎么分配静态IP地址。
1. 第一步， 新建一个以太网接口。
  编辑这个文件 `/etc/network/interfaces`
  ``` S
  iface eth0 inet static # 指定eth0接口使用静态IP地址。
  address 10.42.0.42 # 为eth0接口分配静态IP地址 10.42.0.42
  gateway 10.42.0.1 # 指定默认网关为 10.42.0.1
  netmask 255.255.255.0 # 指定子网掩码为 255.255.255.0，即 /24。
  network 10.42.0.0 # 指定网络地址为 10.42.0.0。
  broadcast 10.42.0.255 # 指定广播地址为 10.42.0.255
  ```
  根据自己的网络情况修改。注意两点：
  - **网络ID相同**：**主机**和**Zynq板子**的网络配置必须在**同一个子网**内。即，主机的IP地址和板子的IP地址在网络部分（如 10.42.0）必须相同，这样它们才能在同一个局域网内进行通信。
  - **主机ID不同**：主机的IP地址和板子的IP地址的**主机部分**（如 42）必须不同，以确保每个设备有唯一的IP地址，避免IP地址冲突。
  例如，如果Zynq板子的IP地址是 10.42.0.10，那么主机的IP地址可以是 10.42.0.42。这两个IP地址在同一个子网内（即网络ID相同），但主机ID不同。
2. 重启网络接口：
   ``` shell
   $ sudo ifdown eth0 && sudo ifup eth0
   ```

#### 2.2.3 串行接口连接主机（Host）
原始文档在[这儿](https://www.koheron.com/support/tutorials/setup-usb-serial-connection/).
串行UART调试接口可以通过micro USB连接器访问。
**重要提示**：先打开电路板，等待电路板启动，然后再连接串行电缆。
要在主机和Zynq板子之间设置USB串行连接，可以按照以下详细步骤操作：

1. **连接串行端口到计算机USB端口**
  你需要一根**USB转串口（UART）电缆**，一端是USB接口，另一端是串口接口（通常是TTL级别的3.3V或5V，或者DB9接口）。比如可以买微雪 Waveshare [的](https://www.waveshare.net/shop/CH343-USB-UART-Board-type-A.htm)。
  ![git](/img/post_ka250/UART.jpeg)
  然后，将电缆的USB端插入你的计算机的USB端口，将电缆的串口端连接到Zynq板子的串行端口（通常是板子上的一个UART接口或DB9接口）。
2. **使用终端程序连接到板子**
   - **选择终端程序**：
     - **Linux**：可以使用`gtkterm`、`minicom`等终端程序。
     - **Windows**：可以使用`Tera Term`、`PuTTY`等终端程序。
   - **安装终端程序**：
     - **Linux**：你可以使用包管理器安装`gtkterm`。例如，在Ubuntu上：
      ```sh
      sudo apt-get install gtkterm
      ```
     - **Windows**：下载并安装`Tera Term`，可以在[Tera Term官网](https://ttssh2.osdn.jp/index.html.en)找到安装程序。
3. 编辑波特率和选择端口
   - **波特率设置**：
     - 打开终端程序（如`gtkterm`或`Tera Term`）。
     - 在终端程序中，找到串口设置选项（通常在“设置”或“配置”菜单下）。
     - 将**波特率设置为`115200`**。这通常是Zynq板子的默认通信速度。
     - 波特率（Baud rate）是指在数据通信中，每秒钟传输的符号（信号变化）的次数。“波特”（Baud），通常表示为每秒多少比特（bits per second, bps）。对于现代串行通信来说，波特率通常等同于比特率，即每秒钟传输的比特数。
   - **选择端口**：
      - 在终端程序中，选择正确的串口端口。你需要找到计算机识别的串口端口名称。
         - **Linux**：串口设备通常以`/dev/ttyUSB0`或`/dev/ttyACM0`等形式出现。你可以使用命令`dmesg | grep tty`来查找。
         - **Windows**：串口设备通常显示为`COM3`、`COM4`等。你可以在设备管理器中查看端口名称。
4. 重启板子
  按下Zynq板子的复位按钮或断电后重新上电。

通过以上步骤，你应该能够在终端程序中看到Zynq板子的启动信息和控制台输出，并能够与板子进行交互。这种连接方式通常用于调试和监控板子的运行状态。
#### Koheron OS 的安装
**Koheron OS** 是个定制的 **Ubuntu 22.04** 操作系统（或者说，Linux发行版），专门为用于Xilinx Zynq平台上的开发和运行优化过。

**下载地址：**从[这儿](https://www.koheron.com/software-development-kit/documentation/ubuntu-zynq/)可以下载镜像。

**初始账号密码：** Login is "root", password is "changeme".

**PS：** Koheron OS 用的是 **动态IP地址** 模式。

#### 安装 Vivado HLx
**Vivado HLx (High-Level Synthesis)** 是**Xilinx 公司**发布的**FPGA硬件设计工具套件**的一部分，用来简化和加速FPGA设计的开发过程。

它叫高层次综合 (High-Level Synthesis)，是因为它支持使用**高级编程语言（如C、C++和SystemC）**进行硬件设计。它可以将这些高级语言的代码转化为**硬件描述语言（HDL）代码**，然后将DHL代码综合为可以在FPGA上实现的**网表**，最后将网表**映射到FPGA资源**上，并进行**布局布线**，生成用于FPGA编程的**比特流文件**。

从[这儿](https://www.xilinx.com/member/forms/download/xef.html?filename=Xilinx_Vivado_SDK_2017.2_0616_1_Lin64.bin&akdm=0)可以下载2017.2版本。

下载之后，需要安装 **Xilinx Vivado SDK 2017.2** 在**Koheron OS**（算是Linux）上。打开一个**Terminal**然后**Run**：

```sh
$ chmod +x Xilinx_Vivado_SDK_2017.2_0616_1_Lin64.bin # 赋予执行权限。chmod +x命令把 .bin（二进制可执行文件） 文件设置为可执行文件。注意根据下载版本进行调整2017.2。
$ sudo ./Xilinx_Vivado_SDK_2017.2_0616_1_Lin64.bin # sudo 是超级用户（root）权限，后面是运行安装包文件，然后写入系统目录和进行配置。
```
之后，第一个`Select Edition to Install`

#### Koheron OS 中找到 Zynq 的动态IP地址

> **动态IP地址**，表示这个IP地址是**动态分配**的，通过**DHCP（动态主机配置协议）**从路由器或DHCP服务器动态获取的。
> 
> 每次设备连接到网络时，DHCP服务器会从一个**可用IP地址池中分配**一个IP地址给设备。这种方式的优点是管理方便，特别是对于大量设备的网络。
> 
> 动态IP地址可能会变化，**每次连接到网络时，设备会获得不同的IP地址**。
> 
> **静态IP地址**是**手动配置**的，管理员在设备上直接设置IP地址。这种方式确保设备始终使用相同的IP地址，适用于需要固定IP地址的设备，如服务器、网络打印机等。

**首先**：

1. 板子安了 Koheron OS 了
2. 板子通过 本地路由器 连接到局域网了。

**然后！**

输入命令：

```shell
$ ip addr show | grep -w inet | grep eth
```
> 这是一个在Linux系统中常用的Shell命令组合。
> 
> - 第一个 `ip addr show` 意思是显示所有网络接口的详细信息，包括**IP地址、MAC地址**等。
> 
> - 第二个 `grep -w inet` 意思是从`ip addr show`的输出中筛选出包含`inet`的行。`inet`表示`IPv4`地址（如果想查看`IPv6`地址则是`inet6`）。`-w`选项确保只匹配完整的单词`inet`，而不是那些包含类似`inet`字符的单词。
> 
> - `grep eth` 进一步从包含`inet`的行中过滤出包含`eth`的行，`eth`通常是以太网接口的前缀（例如`eth0`, `eth1`等）。
> 
> 组合在一起用于快速查找以太网接口的IPv4地址信息。

会出现（例如）：

```shell
inet 192.168.1.11/24 brd 192.168.1.255 scope global dynamic eth0
```
> 网络接口 **eth0** 的**IPv4地址**是 192.168.1.11 
> 
> 子网掩码是 /24（表示子网掩码为 255.255.255.0。这个掩码意味着网络部分是前24位，即 192.168.1 ，主机部分是后8位。） 
> 
> `brd` 表示**广播地址**。广播地址用于向子网上的**所有主机发送消息**。广播地址是 192.168.1.255，且**作用域(scope)**是 global，是全局可路由的，即可以在整个网络范围内使用。 
> 

Here, the IP地址的 network ID（网络部分） is 192.168.1.

然后主机部分的ID，一个**8位的2进制数**显示在板子的**8个LED灯**上，亮就是1，不亮就是0.

![ip](/img/post_ka250/ip.png)
<p class="caption" > 10001000，就是17. </p>

最后动态IP等于网络部分加主机部分 = 192.168.1.17.

#### 用 Koheron OS 给 Zynq board 分配 静态IP地址
在 Koheron OS 中，找到`/etc/network/interfaces`文件，注释掉这一行 `face eth0 inet dhcp` (这是用于设置DHCP的)
`# iface eth0 inet dhcp`
然后Uncomment掉底下 Static IP configuration lines，注意要按照自己的网络配置修改一下。
``` S
iface eth0 inet static
address 10.42.0.100 # 广播 IP address
gateway 10.42.0.1
netmask 255.255.255.0
network 10.42.0.0
broadcast 10.42.0.255
```
### 

#### Koheron SDK
Koheron 软件开发工具包（SDK）是一个简化**Xilinx Zynq®板**嵌入式开发工具。它很方便地实现了**硬件（FPGA）开发**和**软件（Linux C++驱动程序）开发**之间的同步。
```zsh
$ git clone https://github.com/Koheron/koheron-sdk.git
$ cd koheron-sdk
$ make setup
```
##### Python API
我们可以用Python编程来控制Koheron。



**首先**得在Koheron OS里安装Python和相应的Python库。
```sh
$ sudo apt-get install python-pip
$ pip install --upgrade koheron
$ pip install numpy
```

**然后**想要在Python中向板子发送命令的话，板子需要：
- 其Python驱动程序与仪器C++驱动程序一致；
- 连接到仪器的Python应用程序。


基本的控制程序可以从[Koheron Python](https://github.com/Koheron/koheron-sdk/tree/master/python)的GitHub网页上pull下来。其中最重要的是`connect`函数：
`connect(host, instrument_name)`
它能创建一个**客户端对象**（弹出来一个窗口），并通过**TCP**（传输控制协议，一种网络通信协议）连接到仪器上。

Python驱动程序的名称如下：
```python
from koheron import connect
from led_blinker import LedBlinker

client = connect('192.168.1.100', 'led-blinker')
driver = LedBlinker(client)

print(driver.get_forty_two())
```

