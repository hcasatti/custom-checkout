var express = require("express");
var bodyParser = require('body-parser');
var app = express();

app.engine("jade", require("jade").__express);
app.set("views", "./views");
app.set("view engine", "jade")

app.use(express.static("resources"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
	res.render ("index");
});

app.post("/charge", function (req, res) {
	var request = require("request");
	var MP = require("mercadopago");

	mp = new MP ('7929281084187786', 'zgO0UhRBSnDRYLq0M8emV62s7VUw62Vu');
	mp.getAccessToken (function (error, accessToken) {
		if (error) {
			res.send(error);
			return;
		}

		var installments = !isNaN (req.body.installments)? parseInt (req.body.installments, 10) : 1;
		var issuer = !isNaN (req.body.issuer) ? parseInt (req.body.issuer, 10) : null;


		var body = {
			"amount": parseFloat (req.body.amount),
			"payer_email": "test@mp.com",
			"card_token_id": req.body.card_token_id,
			"reason": "Node.js reason",
			"installments": installments
		}
		if (issuer && issuer > 0) {
			body.card_issuer_id = issuer;
		}

		request({
			"method": "POST",
			"url": "https://api.mercadolibre.com/checkout/custom/beta/create_payment?access_token="+accessToken,
			"json": body,
			"agentOptions": {
				"secureProtocol": "SSLv3_method"
			}
		}, function (error, response, body) {
			if (error) {
				res.send (error);
				return;
			}

			if (!body) {
				res.send ("Unhandled error");
				return;
			}

			if (body.error) {
				res.send (body.error.message);
				return;
			}

			console.log (body);

			res.render ("charge", body);
		});
	});
});

var server = app.listen(8888, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log("listening at http://%s:%s", host, port);
});