# 什么是JUC

指的是java.util下的三个并发编程工具包。

- java.util.concurrent 
- java.util.concurrent.atomic 
- java.util.concurrent.locks

![](img-concurrent/juc.png)

# 进程、线程、协程、同步、异步、阻塞、非阻塞、并发、并行、串行

1. **进程**：
   - 进程是操作系统中资源分配和调度的基本单位，代表着系统中运行的一个程序实例。
   - 每个进程都有独立的内存空间和其他系统资源。
   - 不同的进程之间相互隔离，通过进程间通信（IPC）机制进行信息交互。
2. **线程**：
   - 线程是操作系统能够进行运算调度的最小单位，它被包含在进程之中，是进程内部的一个独立执行流。
   - 一个进程中可以包含多个线程。这些线程共享进程的内存空间和其他资源，因此创建和切换线程的开销小于进程。
   - 多线程可以实现进程内部的并发执行，提高CPU利用率。
3. **协程**：
   - 协程是一种用户态的轻量级线程实现，也称作协作式多任务。
   - 它不同于操作系统调度的线程，协程的调度完全由用户程序控制。
   - 协程可以在函数调用时保存上下文并在适当时候恢复执行，允许在单个线程中模拟出多任务效果，且没有线程切换的开销。
4. **同步**：
   - 同步指的是一个操作完成后才会执行下一个操作。
   - 比如在编程中调用一个函数，直到该函数返回结果后，后续代码才会继续执行。
   - 同步执行不会立即返回控制权，而是等待任务完成。
5. **异步**：
   - 异步则是指发起一个操作后，无需等待该操作完成即可继续执行后续代码。
   - 操作结果通过回调，或者通过事件等机制通知调用者。
   - 这种模式下，程序不会阻塞等待某个操作结束，即调用发出后不必等待响应就可以去做别的事情。
6. **阻塞**：
   - 阻塞是指在执行某个操作（如I/O请求）时，调用线程或进程会暂停执行，直到该操作完成。
   - 在此期间，操作系统可能将CPU时间片分配给其他可执行的线程或进程。
7. **非阻塞**：
   - 非阻塞操作则是指调用发出后，调用者不会被挂起，而是立即返回一个状态（如“未准备好”）。
   - 然后调用者可以选择轮询检查操作是否完成，或者通过事件通知机制得知操作完成。
8. **并发**：
   - 并发是指在一段时间内多个任务交替执行，从宏观上看似乎同时发生，但实际上由于CPU时间片轮转，微观上并非真正的同时执行。
   - 并发强调的是多个任务在执行时间上的重叠。
9. **并行**：
   - 并行指两个或多个任务在同一时刻真正地同时执行，尤其在多核或多处理器环境中，每个核心可以独立执行任务，实现物理上的同时处理。
   - 并行强调的是在硬件层面上的真正同时执行。
10. **串行**：
    - 串行是指任务按照严格的顺序执行，一个任务执行完毕后下一个任务才能开始。
    - 在单核系统中，如果没有并发机制的话，所有任务只能串行执行。
    - 即使在多核系统中，若没有充分利用多核特性，也可能表现为串行执行。

# 线程的创建方式

Java实现多线程的方式主要有以下4种：

1. **继承Thread类** 
2. **实现Runnable接口**
3. **实现Callable接口** 
4. **开启线程池**

代码示例：

**继承Thread类**

```java
public class MyThread extends Thread {
    @Override
    public void run() {
        // 任务代码
        System.out.println("线程 " + Thread.currentThread().getName() + " 正在运行...");
    }

    public static void main(String[] args) {
        MyThread thread = new MyThread();
        thread.start(); // 启动线程
    }
}
```

**注意：**Java语言本身是不能直接开启线程的，通过查看**start()方法的源代码**，可以看到Java是通过调用一个叫**start0()的native方法**来实现开启线程的操作的。

```java
/**
 * Thread.java源码中start()方法。
 */
public synchronized void start() {
   
        if (threadStatus != 0)
            throw new IllegalThreadStateException();
        
        group.add(this);

        boolean started = false;
        try {
            // 调用start0()方法
            start0();
            started = true;
        } finally {
            try {
                if (!started) {
                    group.threadStartFailed(this);
                }
            } catch (Throwable ignore) {
                
            }
        }
    }
    // 由操作系统本地方法创建
    private native void start0();
```

**实现Runnable接口**

```java
public class RunnableExample implements Runnable {
    @Override
    public void run() {
        // 任务代码
        System.out.println("线程 " + Thread.currentThread().getName() + " 正在运行...");
    }

    public static void main(String[] args) {
        Runnable task = new RunnableExample();
        Thread thread = new Thread(task);
        thread.start();
    }
}
```

**实现Callable接口** 

```java
public class CallableExample implements Callable<String> {
    @Override
    public String call() throws Exception {
        // 任务代码，可以有返回值
        System.out.println("线程 " + Thread.currentThread().getName() + " 正在运行...");
        return "Callable任务已完成";
    }

    public static void main(String[] args) throws InterruptedException, ExecutionException {
        Callable<String> callable = new CallableExample();
        FutureTask<String> futureTask = new FutureTask<>(callable);
        Thread thread = new Thread(futureTask);
        thread.start();

        // 获取Callable任务的结果
        String result = futureTask.get();
        System.out.println("任务结果：" + result);
    }
}
```

**开启线程池**

```java
public class ThreadPoolExample implements Runnable {
    @Override
    public void run() {
        // 任务代码
        System.out.println("线程 " + Thread.currentThread().getName() + " 正在运行...");
    }

    public static void main(String[] args) {
        // 创建固定大小的线程池
        ExecutorService executorService = Executors.newFixedThreadPool(5);

        // 提交任务
        for (int i = 0; i < 5; i++) {
            executorService.submit(new ThreadPoolExample());
        }

        // 关闭线程池
        executorService.shutdown();
    }
}
```

# 多线程编程步骤

- 创建资源类，定义属性和操作方法
- 创建多线程调用资源类的方法

**卖票例子：**

```java
public class SaleTicket {
    public static void main(String[] args) {

        Ticket ticket = new Ticket();
        
        // 创建多线程调用资源类的方法:这里开启三个线程A,B,C卖票
        new Thread(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 1000; i++) {
                    ticket.sale();
                }
            }
        }, "A").start();

        new Thread(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 1000; i++) {
                    ticket.sale();
                }
            }
        }, "B").start();

        new Thread(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 1000; i++) {
                    ticket.sale();
                }
            }
        }, "C").start();

    }
}

// 创建资源类，定义属性和操作方法
class Ticket {
    private int num = 1000;

    public synchronized void sale() {
        if (num > 0) {
            num--;
            System.out.println(Thread.currentThread().getName() + "卖出一张票:" + "余票" + num);
        }
    }
}

```

# 线程的生命周期

线程从开启到执行完成，会经历一些状态，这些状态一起组成了线程的生命周期。

**线程的状态：**

```java
/**
 * Thread.java源码中State枚举定义了线程可能处于的不同状态。
 */
public enum State {
    
        NEW,

        RUNNABLE,

        BLOCKED,

        WAITING,

        TIMED_WAITING,

        TERMINATED;
    }
```

**线程的生命周期：**

![](img-concurrent/java-thread-lifecycle.png)

1. **新建状态（NEW）** 

   当一个 Thread 对象被创建但尚未调用其 start() 方法时，线程处于新建状态。

   此时线程对象已存在，但并没有分配到任何操作系统资源，也没有开始执行。 

2. **可运行状态（RUNNABLE）**

   包括了两个子状态： 从Java的角度看，RUNNABLE状态包括了READY和RUNNING两种实际的操作系统状态。

   i. 就绪状态（READY）: 

   线程已经调用了 start() 方法，且线程调度器随时可以将其分配给CPU进行执行。

   线程在就绪队列中等待，一旦得到CPU时间片，它就转为运行状态。

   ii. 运行状态（RUNNING）: 

   线程正在执行其 run() 方法。

3. **阻塞状态（BLOCKED）** 

   线程试图获取一个监视器锁（synchronized块或方法），但锁被其他线程持有，因此该线程会暂时停止执行并进入阻塞状态，直到获得锁。

4. **等待状态（WAITING）**

   线程调用了 `Object.wait() 、 Thread.join() 或者 LockSupport.park()` 方法，进入了无限期等待状态。

   线程不会继续执行，除非其他线程对此线程发出 notify() 或者 notifyAll() 信号。

5. **定时等待状态（TIMED_WAITING）**

   线程调用了带有超时参数的方法如 `Thread.sleep(long millis) 、 Object.wait(long timeout) 、 Thread.join(long millis) 、 LockSupport.parkNanos() 或 LockSupport.parkUntil()` 后进入此状态。

   在这个状态下，线程将在指定的时间过后自动返回，不再需要其他线程的显式唤醒。

6. **终止状态（TERMINATED）**

   线程完成了它的任务或者因为异常退出了 run() 方法，线程已经结束执行。

   一旦线程达到终止状态，就不能再次变为其他状态。

# Synchronized与Lock锁

## 多线程编程步骤

- 创建资源类，定义属性和操作方法
- 创建多线程调用资源类的方法

**卖票例子：**

- **synchronized实现**

```java
public class SaleTicket {
    public static void main(String[] args) {

        Ticket ticket = new Ticket();
        
        // 创建多线程调用资源类的方法:这里开启三个线程A,B,C卖票
        new Thread(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 1000; i++) {
                    ticket.sale();
                }
            }
        }, "A").start();

        new Thread(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 1000; i++) {
                    ticket.sale();
                }
            }
        }, "B").start();

        new Thread(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 1000; i++) {
                    ticket.sale();
                }
            }
        }, "C").start();

    }
}

// 创建资源类，定义属性和操作方法
class Ticket {
    private int num = 1000;

    public synchronized void sale() {
        if (num > 0) {
            num--;
            System.out.println(Thread.currentThread().getName() + "卖出一张票:" + "余票" + num);
        }
    }
}

```

- **lock锁实现**

```java
import java.util.concurrent.locks.ReentrantLock;

public class LSaleTicket {
    public static void main(String[] args) {
        LTicket lTicket = new LTicket();

        new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                lTicket.sale();
            }
        }, "A").start();

        new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                lTicket.sale();
            }
        }, "B").start();

        new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                lTicket.sale();
            }
        }, "C").start();
    }

}

class LTicket {
    private int num = 1000;
	
	// 创建可重入锁
    private final ReentrantLock lock = new ReentrantLock();

    public void sale() {
        lock.lock();
        try {
            if (num > 0) {
                num--;
                System.out.println(Thread.currentThread().getName() + "卖出一张票，余票" + num);
            }
        // 必须放在finally块中解锁，防止死锁
        } finally {
            lock.unlock();
        }

    }
}

```

## 两者对比

- **synchronized**

  - 内置关键字，使用简单，无需手动获取和释放锁。
  - 作用于方法或代码块，隐式关联对象锁。
  - 线程在获取不到锁时会自动进入阻塞状态，无需手动处理异常。
  - 不支持超时获取锁和尝试获取锁，也无法得知锁的状态。
  - 发生异常时会自动释放锁，避免死锁的发生。
  - 支持可重入，即持有锁的线程可以再次申请同一把锁。

- **Lock接口及其实现类（如ReentrantLock）**

  - 是Java并发包（java.util.concurrent）中提供的一个接口，相比`synchronized`更灵活、功能更多样。
  - 需要手动调用`lock()`和`unlock()`方法来获取和释放锁。
  - 支持尝试获取锁（tryLock()）、超时获取锁（tryLock(long timeout, TimeUnit unit)）以及公平锁和非公平锁的选择。
  - 可以在finally块中释放锁以确保锁一定会被释放，增强了代码的健壮性。
  - 通过`newCondition()`方法可以创建Condition对象，实现多路分支通知和等待，比`synchronized`的wait()/notify()机制更强大和灵活。
  - 也支持可重入，如ReentrantLock。

  综上所述，虽然`synchronized`使用起来相对简单，但对于更复杂的同步需求，如超时控制、中断、多条件等待等场景，使用`Lock`接口及其实现类能提供更多的控制能力。同时，`Lock`在性能方面也有一定的优化空间。

# 八锁现象

“8锁现象”（Eight Lock Phenomena）是在Java并发编程中讨论同步机制时提到的一个概念，它并不是指代具体的8种锁类型，而是用来形象化表示在使用`synchronized`关键字时可能出现的几种典型的同步状况或问题。这些状况揭示了如何正确理解和运用`synchronized`关键字，以及在不同的上下文中锁住的对象和锁的粒度。

1. **普通同步方法**：锁住的是调用方法的对象实例，谁先拿到锁谁先执行，同一个对象拿到的是同一把锁。
2. **静态同步方法**：锁住的是类的Class对象（ClassName.class），由于类只加载一 次，因此同一类的所有实例共享同一把锁。
3. **非静态非同步方法：**由于不受锁控制，因此不受锁的影响。
4. **同步代码块**：可以指定任意对象作为锁，与普通同步方法的区别在于锁对象的灵活性。

# 线程间通信

## 概念

- 在多线程模式下进行工作，除了要考虑各个线程之间是否同步、如何竞争锁等问题，还要考虑这样一个问题：线程之间有的时候需要相互配合来共同完成一件事情。

- 把一个大的任务拆分成多个不同的任务线，每个任务线中都有更小的执行步骤。各个线程之间需要彼此配合：A 线程执行一步唤醒 B 线程，自己等待；B 线程执行一步，唤醒 A 线程，自己等待……

## 核心语法

1. Object 类的 wait() 方法
   - wait() 方法会导致当前线程进入等待状态
   - 必须是另外一个线程调用 notify() 或 notifyAll() 方法来唤醒
   - “for this object” 表示还是要使用同一个对象分别调用 wait()、notify()、notifyAll() 这些方法

2. Object 类的 notify() 方法
   - notify() 方法只唤醒一个线程
   - 处于等待状态的线程会被存放在对象监视器中的一个数组中
   - 如果在这个对象的监视器中维护的处于等待状态的线程是多个，那么 notify() 方法会随机唤醒一个
   - notfiy() 方法无法精确唤醒一个指定的线程，这个需求可以通过 **Lock + Condition 方式实现（定制化通信）**

3. Object 类的 notifyAll() 方法
   - 唤醒当前对象监视器上等待的所有线程。

## 案例演示

- **模拟生产者消费者模型**

- 设定一个成员变量，作为两个线程都要操作的共享数据，设置初始化值为 0
- A 线程执行 +1 操作
- B 线程执行 -1 操作
- A、B 两个线程交替执行

**synchronized代码实现**

```java
public class STest {
    public static void main(String[] args) {
        Share share = new Share();

        new Thread(() -> {
            for (int i = 0; i < 50; i++) {
                try {
                    share.incr();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, "AA").start();
        
        new Thread(() -> {
            for (int i = 0; i < 50; i++) {
                try {
                    share.decr();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, "BB").start();

    }
}

class Share {

    private int num = 0;

    public synchronized void incr() throws InterruptedException {
        if (num > 0) {
            this.wait();
        }
        num++;
        System.out.println(Thread.currentThread().getName() + "::" + num);
        this.notifyAll();
    }

    public synchronized void decr() throws InterruptedException {
        if (num <= 0) {
            this.wait();
        }
        num--;
        System.out.println(Thread.currentThread().getName() + "::" + num);
        this.notifyAll();
    }

}

```

## 虚假唤醒

> 当上面的例子中，线程数量从两个增加到四个，计算结果就会出错：
> thread-a 线程：1
> thread-c 线程：2
> thread-a 线程：3
> thread-b 线程：2
> thread-d 线程：1

**原因：**使用 if 的情况（仅判断一次）

> 假设C线程判断`num<=0`后，进行等待（在哪里等就在哪里醒），被别的线程唤醒后不会再进行`num判断`，会导致数值不符合预期。

![](img-concurrent/if.png)

**解决：**使用 while 解决问题

> 要解决虚假唤醒问题，就需要对线程间通信时的判断条件使用 while 循环结构来执行，而不是 if 分支判断。

![](img-concurrent/while.png)

**Lock代码实现**

```java
public class Demo02 {
    public static void main(String[] args) {
        Share share = new Share();


        new Thread(() -> {
            for (int i = 0; i < 50; i++) {
                try {
                    share.incr();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, "AA").start();

        new Thread(() -> {
            for (int i = 0; i < 50; i++) {
                try {
                    share.decr();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, "BB").start();

        new Thread(() -> {
            for (int i = 0; i < 50; i++) {
                try {
                    share.decr();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, "CC").start();

    }
}

class Share {

    private int num = 0;

    private final Lock lock = new ReentrantLock();
    private final Condition condition = lock.newCondition();

    public void incr() throws InterruptedException {
        lock.lock();
        
        try {
            while (num > 0) {
                // 等待
                condition.await();
            }
            num++;
            System.out.println(Thread.currentThread().getName() + "::" + num);
            // 通知
            condition.signalAll();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }

    }

    public void decr() throws InterruptedException {
        lock.lock();

        try {
            while (num <= 0) {
                condition.await();
            }
            num--;
            System.out.println(Thread.currentThread().getName() + "::" + num);
            
            condition.signalAll();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
}

```

## 定制化通信

可以通过可重入锁的多种情况来达成，每把钥匙都对应同一把重入锁

```java
private Lock lock = new ReentrantLock();
//声明钥匙 A
private Condition conditionA = lock.newCondition();
//声明钥匙 B
private Condition conditionB = lock.newCondition();
//声明钥匙 C
private Condition conditionC = lock.newCondition();

```

```
conditionA.await();  //A等待
conditionA.signal(); //唤醒A
```

## 代码演示

- A 线程打印 5 次 A，B 线程打印 10 次 B，C 线程打印 15 次 C
- 按照此顺序循环 10 轮

```java
public class Laptoy {
    public static void main(String[] args) {
        Test test = new Test();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    test.printA(i);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }, "AA").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    test.printB(i);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }, "BB").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    test.printC(i);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }, "CC").start();


    }
}

class Test {
    //通信对象:0--打印 A 1---打印 B 2----打印 C
    private int number = 0;
    //声明锁
    private Lock lock = new ReentrantLock();
    //声明钥匙 A
    private Condition conditionA = lock.newCondition();
    //声明钥匙 B
    private Condition conditionB = lock.newCondition();
    //声明钥匙 C
    private Condition conditionC = lock.newCondition();

    /**
     * A 打印 5 次
     */
    public void printA(int j) {
        try {
            lock.lock();
            while (number != 0) {
                conditionA.await();
            }
            System.out.println(Thread.currentThread().getName() + "输出 A,第" + j + " 轮开始");
            //输出 5 次 A
            for (int i = 0; i < 5; i++) {
                System.out.println("A");
            }
            //开始打印 B
            number = 1;
            //唤醒 B
            conditionB.signal();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }

    /**
     * B 打印 10 次
     */
    public void printB(int j) {
        try {
            lock.lock();
            while (number != 1) {
                conditionB.await();
            }
            System.out.println(Thread.currentThread().getName() + "输出 B,第" + j + " 轮开始");
            //输出 10 次 B
            for (int i = 0; i < 10; i++) {
                System.out.println("B");
            }
            //开始打印 C
            number = 2;
            //唤醒 C
            conditionC.signal();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }

    /**
     * C 打印 15 次
     */
    public void printC(int j) {
        try {
            lock.lock();
            while (number != 2) {
                conditionC.await();
            }
            System.out.println(Thread.currentThread().getName() + "输出 C,第" + j + " 轮开始");
            //输出 15 次 C
            for (int i = 0; i < 15; i++) {
                System.out.println("C");
            }
            System.out.println("-----------------------------------------");
            //开始打印 A
            number = 0;
            //唤醒 A
            conditionA.signal();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
}

```

# 集合的线程安全问题



# 一、什么是JUC

# 二、线程的生命周期

# 三、Synchronized与Lock锁

# 四、线程间通信

# 五、八锁现象

# 六、集合类线程安全问题

# 七、常用辅助类

# 八、读写锁

# 九、阻塞队列

# 十、线程池

# 十一、函数式接口

# 十二、stream流式计算

## 四大函数式接口

**Java**内置四大核心函数式接口

| 函数式接口               | 参数类型 | 返回类型 | 接口方法                                                     |
| :----------------------- | :------: | :------: | :----------------------------------------------------------- |
| Consumer<T> 消费型接口   |    T     |   void   | 对类型为T的对象应用操作，包含方法：void accept(T t)          |
| Supplier<T> 供给型接口   |    无    |    T     | 返回类型为T的对象，包含方法：T get();                        |
| Function<T,R> 函数型接口 |    T     |    R     | 对类型为T的对象应用操作，并返回结果。结果是R类型的对象。包含方法：R apply(T t); |
| Predicate<T> 断定型接口  |    T     | boolean  | 确定类型为T的对象是否满足某约束，并返回boolean值。包含方法：boolean test(T t); |

# 十三、ForkJoin

# 十四、异步回调

# 十五、JMM Java内存模型

# 十六、单例模式

# 十七、深入理解CAS

# 十八、原子引用避免ABA问题

# 十九、Java中的锁

> 引用：
>
> - java--JUC快速入门（彻底搞懂JUC）https://blog.csdn.net/qq_53808097/article/details/132174660
> - 学习JUC高并发编程这一篇就够了（上篇）https://blog.csdn.net/apple_53947466/article/details/123656594
> - 学习JUC高并发编程这一篇就够了（下篇）https://blog.csdn.net/apple_53947466/article/details/123664861
