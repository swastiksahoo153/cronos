# Cronos

### A reliable and scalable distributed job scheduling system that can execute, manage, and monitor a variety of tasks. The system should support one-time jobs as well as recurring jobs, providing comprehensive job management functionality. While the system will primarily handle backend functionalities, there should be provision for interaction with a potential frontend through well-defined APIs.

1. Job Submission: Implement a mechanism for users to submit jobs that can be executed either immediately or at a specific future time. The submitted jobs can be of various types and complexities.
2. Recurring Jobs: The system should be capable of handling jobs that recur at specified intervals. This could include hourly, daily, weekly, or monthly tasks.
3. Job Management: Create APIs for users to manage their jobs. This should allow them to view the status of their jobs, cancel jobs, and reschedule jobs.
4. Failure Handling: Design a mechanism to handle job failures, with a system for automatic retries. If a job consistently fails, the system should notify the user.
5. Logging and Monitoring: The system should maintain detailed logs of all job executions. Implement a monitoring system that keeps track of job statuses and overall system health.

## High Level Design

![High Level Design](./readme-assets/HLD.png)

```
Task Addition Handling
-

Task Deletion Handling
- Simply remove all the jobs for that task from redis

Task Modification Handling
- Follow deletion + addition steps
```
