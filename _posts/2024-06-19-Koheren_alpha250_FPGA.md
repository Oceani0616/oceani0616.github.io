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
**Koheron Alpha-250 FPGA 手册（完整版）珍藏版、周年纪念版、限量版等等**

# 0 为什么写这个

因为我们要做一个里德堡原子探头，需要用这玩意做光电信号采集处理终端。然而好像只有[官方参考文档](https://www.koheron.com/fpga/alpha250-signal-acquisition-generation)可以参考，没有其他任何包括CSDN什么的第三方资料。没事，俺可以根据官方文档和ChatGPT自己弄一个，就当是自己必须从头学起的笔记了。

# 1 关于 Koheron Alpha-250 FPGA
**ALPHA-250**是围绕**Zynq 7020 SoC**构建的可编程板。

**Zynq 7020 SoC**具有**100 MHz射频前端**，带有**14位ADC和16位DAC**，频率为**250 MSPS**。射频通道由一个**双PLL、超低抖动时钟发生器**锁时（clocked）。时钟发生器包括一个**4通道24位ADC**和一个**4通道16位DAC**。该板具有全面的开源FPGA/Linux参考设计。这个挺贵的：
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


## 1.2 Alpha-250 FPGA 架构简介
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
## 1.3 Alpha-250 FPGA 子系统
### 1.3.1 射频ADC
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



# 2 操作指南
## 2.1 开机
首先，将micro-SD卡插入micro-SD插槽。然后连接电源的12V插孔。绿色LED（PWGD）说明通电了，橙色LED（DONE）说明FPGA完成啦。反正表示系统已正确启动。
## 2.2 连接板子
### 2.2.1 LAN
和板子连接最主要的方法就是**以太网接口**，就是插网线。
### 2.2.2 直接连电脑 
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

### 2.2.3 串行接口连接主机（Host）
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
### Koheron OS 的安装
**Koheron OS** 是个定制的 **Ubuntu 22.04** 操作系统（或者说，Linux发行版），专门为用于Xilinx Zynq平台上的开发和运行优化过。

**下载地址：**从[这儿](https://www.koheron.com/software-development-kit/documentation/ubuntu-zynq/)可以下载镜像。

**初始账号密码：** Login is "root", password is "changeme".

**PS：** Koheron OS 用的是 **动态IP地址** 模式。

### 安装 Vivado HLx
**Vivado HLx (High-Level Synthesis)** 是**Xilinx 公司**发布的**FPGA硬件设计工具套件**的一部分，用来简化和加速FPGA设计的开发过程。

它叫高层次综合 (High-Level Synthesis)，是因为它支持使用**高级编程语言（如C、C++和SystemC）**进行硬件设计。它可以将这些高级语言的代码转化为**硬件描述语言（HDL）代码**，然后将DHL代码综合为可以在FPGA上实现的**网表**，最后将网表**映射到FPGA资源**上，并进行**布局布线**，生成用于FPGA编程的**比特流文件**。

从[这儿](https://www.xilinx.com/member/forms/download/xef.html?filename=Xilinx_Vivado_SDK_2017.2_0616_1_Lin64.bin&akdm=0)可以下载2017.2版本。

下载之后，需要安装 **Xilinx Vivado SDK 2017.2** 在**Koheron OS**（算是Linux）上。打开一个**Terminal**然后**Run**：

```sh
$ chmod +x Xilinx_Vivado_SDK_2017.2_0616_1_Lin64.bin # 赋予执行权限。chmod +x命令把 .bin（二进制可执行文件） 文件设置为可执行文件。注意根据下载版本进行调整2017.2。
$ sudo ./Xilinx_Vivado_SDK_2017.2_0616_1_Lin64.bin # sudo 是超级用户（root）权限，后面是运行安装包文件，然后写入系统目录和进行配置。
```
之后，第一个`Select Edition to Install`

### Koheron OS 中找到 Zynq 的动态IP地址

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

### 用 Koheron OS 给 Zynq board 分配 静态IP地址
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
## 

### Software Development Kit ｜ Koheron SDK
Koheron 软件开发工具包（SDK）是一个简化**Xilinx Zynq®板**嵌入式开发工具。它很方便地实现了**硬件（FPGA）开发**和**软件（Linux C++驱动程序）开发**之间的同步。
```zsh
$ git clone https://github.com/Koheron/koheron-sdk.git
$ cd koheron-sdk
$ make setup
```
#### Python API
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

