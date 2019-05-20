var imposter = require('./imposter'), productPort = 3000;

function createProductImposter() {
	return imposter({ 
				port: productPort,
				protocol: "http",
				name: "Product Service"
			})
		.withStub()
		.matchingRequest({equals: {path: "/products"}}) 
		.respondingWith({ 
			statusCode: 200,
			headers: {"Content­Type": "application/json"},
			body: {
				products: [
					{
						id: "2599b7f4",
						name: "The Midas Dogbowl",
						description: "Pure gold"
					},
					{
						id: "e1977c9e",
						name: "Fishtank Amore",
						description: "Show your fish some love"
					}
				]
			}
		})
		.create(); 
}
var contentPort = 4000;

function createContentImposter() {
	return imposter({
			port: contentPort,
			protocol: "http",
			name: "Content Service"
		})
		.withStub()
		.matchingRequest({
				equals: { 
				path: "/content", 
				query: { ids: "2599b7f4,e1977c9e" } 
				} 
			})
		.respondingWith({
			statusCode: 200,
			headers: {"Content­Type": "application/json"},
			body: {
				content: [ 
					{ 
						id: "2599b7f4", 
						copy: "Treat your dog like the king he is", 
						image: "/content/c5b221e2" 
					}, 
					{ 
						id: "e1977c9e", 
						copy: "Love your fish; they'll love you back", 
						image: "/content/a0fad9fb" 
					} 
				] 
			}
		})
		.create();
}