const getDataStorePath = function(env) {
  return env.DATA_STORE || './data/comments.json';
};

module.exports = { getDataStorePath };
