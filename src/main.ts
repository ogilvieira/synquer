interface Job {
  action: Function;
  resolve?: Function;
  reject?: Function;
}

export class Synquer {
  private queue: Job[];
  private isDraining: Boolean;
  private isRunning: Boolean;
  
  constructor() {
    this.queue = [];
    this.isDraining = false;
    this.isRunning = false;
  }

  private async drain() {
    this.isDraining = true;

    const job: Job | undefined = this.queue.length ? this.queue.shift() : undefined;

    if (job) {
      await this.run(job);
    } else {
      this.isDraining = false;
    }
  }

  private async run(job: Job) {
    this.isRunning = true;
    try {
      const response = await job.action();
      if (typeof job.resolve === "function") {
        job.resolve(response);
      }
      return response;
    } catch (ex) {
      if (typeof job.reject === "function") {
        job.reject(ex);
      } else {
        throw ex;
      }
    } finally {
      this.isRunning = false;
      this.drain();
    }
  }
  
  execute(action: Function) {
    if (!this.isDraining && !this.isRunning) {
      return this.run({ action });
    }
   
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject, action });
    });
  }
}

export default Synquer;