const tf = require("@tensorflow/tfjs-node") ;

let trainResult =[];
let data_raw =[];
let sma_vec = [];
let window_size = 2;
let trainingsize = 146; 

//获取sma
 function getSMA(data,window_size){
  let r_avgs = [], avg_prev = 0;
  for (let i = 0; i <= data.length - window_size; i++){
    let curr_avg = 0.00, t = i + window_size;
    for (let k = i; k < t && k <= data.length; k++){
      curr_avg += data[k]['price'] / window_size;
    }
    r_avgs.push({ set: data.slice(i, i + window_size), avg: curr_avg });
    avg_prev = curr_avg;
  }
  return r_avgs;
}

 function hello(data){
  console.log("xx");
}

 async function getTrainModel(result,long){
  for(let i=0;i<result.length;i++){
    data_raw.push({timestamp:result[i].time,price:result[i].num})
  }
  if(data_raw.length>0){
    let timestamps = data_raw.map(function(val){
      return val['timestamp'];
    });
    let prices = data_raw.map(function(val){
      return val['price'];
    });
    console.log("分离数据后",timestamps[timestamps.length-1],prices[prices.length-1]);
  }
  sma_vec = getSMA(data_raw,window_size);
    console.log('平均数',sma_vec[sma_vec.length-1]);

  
  let epoch_loss = [];
  let inputs = sma_vec.map(function(inp_f){
    return inp_f['set'].map(function(val){
      return val['price'];
    })
  });
  let outputs = sma_vec.map(function(outp_f){
    return outp_f['avg'];
  });
  // 轮次
  let n_epochs = 10;
  // 学习率
  let learningrate = 0.01;
  // 隐藏层数量
  let n_hiddenlayers = 4;
  inputs = inputs.slice(0,inputs.length-21);
  outputs = outputs.slice(0,outputs.length-21);
  let callbacks = function(epoch,log){
    epoch_loss.push(log.loss);
    console.log('轮次',epoch+1,'每轮损失:',log.loss);
  }
  trainResult = await trainModel(inputs,outputs,window_size,n_epochs,learningrate,n_hiddenlayers,callbacks);
  let inputsx = sma_vec.map(function(inp_f){
    return inp_f['set'].map(function(val){
      return val['price']
    })
  });
  let val_unseen_x = inputsx.slice(inputsx.length-long,inputsx.length);
  console.log("val_unseen_x",val_unseen_x);
  let val_unseen_y = makePredictions(val_unseen_x,trainResult['model'],trainResult['normalize']);
  console.log("val_unseen_y",val_unseen_y);
  return val_unseen_y;

}

async function trainModel(X, Y, window_size, n_epochs, learning_rate, n_layers, callback){

  const batch_size = 32;

  // input dense layer
  const input_layer_shape = window_size;
  const input_layer_neurons = 64;

  // LSTM
  const rnn_input_layer_features = 16;
  const rnn_input_layer_timesteps = input_layer_neurons / rnn_input_layer_features;
  const rnn_input_shape = [rnn_input_layer_features, rnn_input_layer_timesteps]; // the shape have to match input layer's shape
  const rnn_output_neurons = 16; // number of neurons per LSTM's cell

  // output dense layer
  const output_layer_shape = rnn_output_neurons; // dense layer input size is same as LSTM cell
  const output_layer_neurons = 1; // return 1 value

  // ## old method
  // const xs = tf.tensor2d(X, [X.length, X[0].length])//.div(tf.scalar(10));
  // const ys = tf.tensor2d(Y, [Y.length, 1]).reshape([Y.length, 1])//.div(tf.scalar(10));

  // ## new: load data into tensor and normalize data

  const inputTensor = tf.tensor2d(X, [X.length, X[0].length])
  const labelTensor = tf.tensor2d(Y, [Y.length, 1]).reshape([Y.length, 1])

  const [xs, inputMax, inputMin] = normalizeTensorFit(inputTensor)
  const [ys, labelMax, labelMin] = normalizeTensorFit(labelTensor)

  // ## define model

  const model = tf.sequential();

  model.add(tf.layers.dense({units: input_layer_neurons, inputShape: [input_layer_shape]}));
  model.add(tf.layers.reshape({targetShape: rnn_input_shape}));

  let lstm_cells = [];
  for (let index = 0; index < n_layers; index++) {
       lstm_cells.push(tf.layers.lstmCell({units: rnn_output_neurons}));
  }

  model.add(tf.layers.rnn({
    cell: lstm_cells,
    inputShape: rnn_input_shape,
    returnSequences: false
  }));

  model.add(tf.layers.dense({units: output_layer_neurons, inputShape: [output_layer_shape]}));

  model.compile({
    optimizer: tf.train.adam(learning_rate),
    loss: 'meanSquaredError'
  });

  // ## fit model

  const hist = await model.fit(xs, ys,
    { batchSize: batch_size, epochs: n_epochs, callbacks: {
      onEpochEnd: async (epoch, log) => {
        callback(epoch, log);
      }
    }
  });

  // return { model: model, stats: hist };
  return { model: model, stats: hist, normalize: {inputMax:inputMax, inputMin:inputMin, labelMax:labelMax, labelMin:labelMin} };
}

function makePredictions(X, model, dict_normalize)
{
    // const predictedResults = model.predict(tf.tensor2d(X, [X.length, X[0].length]).div(tf.scalar(10))).mul(10); // old method
    
    X = tf.tensor2d(X, [X.length, X[0].length]);
    const normalizedInput = normalizeTensor(X, dict_normalize["inputMax"], dict_normalize["inputMin"]);
    const model_out = model.predict(normalizedInput);
    const predictedResults = unNormalizeTensor(model_out, dict_normalize["labelMax"], dict_normalize["labelMin"]);

    return Array.from(predictedResults.dataSync());
}

function normalizeTensorFit(tensor) {
  const maxval = tensor.max();
  const minval = tensor.min();
  const normalizedTensor = normalizeTensor(tensor, maxval, minval);
  return [normalizedTensor, maxval, minval];
}

function normalizeTensor(tensor, maxval, minval) {
  const normalizedTensor = tensor.sub(minval).div(maxval.sub(minval));
  return normalizedTensor;
}

function unNormalizeTensor(tensor, maxval, minval) {
  const unNormTensor = tensor.mul(maxval.sub(minval)).add(minval);
  return unNormTensor;
}

module.exports={
  hello,
  getTrainModel
}

