function getTaskKey(taskId) {
  return `taskId#${taskId}`;
}

function getNotifierKey(key) {
  return `notifier#${key}`;
}

module.exports = {
  getTaskKey,
  getNotifierKey,
};
