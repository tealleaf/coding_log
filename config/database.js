if (process.env.NODE_ENV === 'production') {
	module.exports = {mongoURI: 
		'mongodb://quynh:meepmeep1@ds111562.mlab.com:11562/coding_log'}
} else {
	module.exports = {mongoURI: 'mongodb://localhost/coding_log'}
}