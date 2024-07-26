---
layout:     post
title:      "FPGA 学习笔记"
subtitle:   "在干了在干了"
date:       2024-07-19 14:13:16
author:     "Oceani Cheng"
Comments:    true
header-img: "img/post_FPGA/girl in rain room_cyber.jpg"
tags:
    - FPGA
    - Alita
    - Note
---

# FPGA 学习笔记


这首歌真是绝了。Whisper of Rain, 翻译过来叫**雨的呢喃**。**76MB的无损Flac**，记得带上Hifi耳机听。
<audio controls>
  <source src="/assets/music/Whispers of Rain - Dan Gibson.flac" type="audio/flac">
</audio>

另外，我最近领悟了一部绝世武功心法秘籍，那就是**不带情绪地看问题、做事情**。看问题突然就清晰了，逻辑突然就通畅了，把忍受变接受。

## 1. 编程语言

### 1.1 硬件描述语言 HDL
VHDL, Verilog, SystemVerilog
基本都是从[hdlbits](https://hdlbits.01xz.net/)这个刷题网站上学的。
硬件**描述**语言，并不是硬件**设计**语言，描述的意思是不能改变硬件的架构，只是描述它，将某一些部分连起来。
#### 1.1.1 Verilog
##### 1.1.1.1 语法
**可综合**的意思是可以直接整合成电路。

**模块**
```verilog
module module_name (input a, input b, output y); // 括号里是端口列表
    // 定义信号和端口类型
    assign y = a & b; // 使用逻辑与操作
endmodule
```
**逻辑门**
- **AND**

**`assign y = a & b`，a、b都是0，y才是1.**
![git](/img/post_FPGA/Andgate.png)
<p class="caption" > AND gate | 与门 </p>

- **NOR**

**A NOR gate is an OR gate with its output inverted.**

In Verilog, a NOR gate performs the logical NOT operation after an OR operation, meaning the output is true (1) only when all inputs are false (0). a、b都是1，y才是0.

`assign y = ~(a | b)`

![git](/img/post_FPGA/Norgate.png)
<p class="caption" > Nor gate | 或非门 </p>

- **XOR 异或门**

**`assign y = a ^ b`，a、b只有**1**个是1（高电平），y才是1（高电平）.**

- XNOR

An XNOR gate, also known as an "equivalence gate," outputs true (1) if the number of true inputs is even. 

**只有其中一项输入为高，输出为低；否则出高。**

`assign y = ~(a ^ b)`
![git](/img/post_FPGA/Xnorgate.png)
<p class="caption" > Xnor gate | 相等门 </p>

It first performs an XOR operation on `a` and `b` and then negates the result using the bitwise NOT operator (`~`). The XOR operation (`^`) results in true if the inputs are different and false if they are the same. The NOT operation then inverts this result, giving the XNOR behavior.

- **7458 chip**

![7548](/img/post_FPGA/7458.png)
<p class="caption" > Xnor gate | 相等门 </p>

```verilog
module top_module (
    input p1a, p1b, p1c, p1d, p1e, p1f,
    output p1y,
    input p2a, p2b, p2c, p2d,
    output p2y
);
    // Internal wires for intermediate signals
    wire im1, im2, im3, im4;

    // AOI gate logic for p2y
    assign im1 = p2a & p2b;
    assign im2 = p2c & p2d;
    assign p2y = im1 | im2;

    // AOI gate logic for p1y
    assign im3 = p1a & p1b & p1c;
    assign im4 = p1d & p1e & p1f;
    assign p1y = im3 | im4;

endmodule
```
也可以合并：

```verilog
p2y = (p2a & p2b) | (p2c & p2d)
p1y = (p1a & p1b & p1c) | (p1d & p1e & p1f)
```

**数字**
`0:b1`

**端口**
用于在模块（Module）之间传递信号（signal）
- `input`：输入端口
- `output`：输出端口
- `inout`：双向端口

端口通常被声明为 `wire` 类型，特别需要存储值时使用 `reg`
```verilog
module example_module (
    input  wire a,    // 输入端口
    output wire b,    // 输出端口
    inout  wire c     // 双向端口
);
```

  
**数据类型**
- 信号（Signal）
  - **信号** is also often called a **driver** that drives a value onto a wire.
  - Describing signals as being driven (has a known value determined by something attached to it) or not driven by something。
  - 
- `wire`：连续赋值
  - **信号线**。不能存储值，仅用于连接和传递信号。
  - 用作模块端口的类型，用于连接模块之间的信号。
  - 还可以用于模块内部，连接不同的逻辑单元或用于组合逻辑的描述，连接模块内部的信号。
- `reg`：用于存储值的变量，通常用于过程块。

**赋值语句**
- 连续赋值：`assign` 语句用于持续地驱动 `wire` 类型的信号。`assign` 只是把输入或者输出的`wire`连起来，所以顺序不重要
```verilog
assign y = a & b;
```

- 过程赋值：在 `always` 块或 `initial` 块中使用 `=` 或 `<=` 赋值。
```verilog
always @ (posedge clk) begin
    q <= d;
end
```

**操作符**
- 逻辑操作符：`&`、`|`、`~`
- 比较操作符：`==`、`!=`、`<`、`>`
- 算术操作符：`+`、`-`、`*`、`/`


**条件语句**
- `if-else` 语句
```verilog
if (condition) begin
    // 真值条件下执行
end else begin
    // 否则执行
end
```

- `case` 语句
```verilog
case (变量)
    值1: begin
        // 对应值1时执行
    end
    值2: begin
        // 对应值2时执行
    end
    default: begin
        // 默认情况
    end
endcase
end
```



**`always` 和 `initial` 块**
- `always`：用于描述持续触发的行为，比如时钟敏感的行为。
  ```verilog
  always @ (posedge clk) begin
      // 时钟上升沿时执行
  end
  ```

- `initial`：用于初始化操作，只执行一次。
  ```verilog
  initial begin
      // 初始块中的代码
  end
  ```

### 1.2 寄存器传输语言 RTL
写简单的测试平台。
硬件电路是并行执行的。
## 1.2.1 组合电路
## 1.2.2 时序电路
## 1.2.3 状态机

## 2. 开发工具/仿真工具

### 2.1 Vivado (Xilinx, By AMD)

### 2.1 Quartus (By Intel)


## 3. 专业知识
数字电路，接口，计算机体系结构，信号处理

