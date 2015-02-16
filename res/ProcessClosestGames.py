import json, argparse, math, operator

class Game:
	x = 0
	y = 0
	z = 0
	id = -1

	def __init__(self, x, y, z, id):
		self.x = x
		self.y = y
		self.z = z
		self.id = id

	def distanceTo(self, nextGame):
		dx = math.pow(self.x - nextGame.x, 2)
		dy = math.pow(self.y - nextGame.y, 2)
		dz = math.pow(self.z - nextGame.z, 2)

		return math.sqrt(dx + dy + dz)

if __name__ == '__main__':
	parser = argparse.ArgumentParser(description='Preprocess Game Metadata to get closest games')
	parser.add_argument('--games', required=True, dest="games", metavar='FILE',  help='The game JSON file to read from')
	parser.add_argument('--output-file', required=True, dest='output_file', metavar='NAME', help='The output JSON file template')

	args = parser.parse_args()

	gamefile = args.games
	output = args.output_file

	gamefile = open(gamefile, "r")

	myObj = json.load(gamefile)

	games = [];
	for game in myObj:
		games.append(Game(game["coords"][0], game["coords"][1], game["coords"][2], game["id"]))

	gamesdata = []
	counter = 0
	for game in games:
		gamedata = {}
		gamedata["id"] = game.id

		distances = []
		for game2 in games:
			distances.append( (game.distanceTo(game2), game2.id) )
		distances.sort(key=operator.itemgetter(0))

		closest = [ distances[1][1], distances[2][1], distances[3][1], distances[4][1], distances[5][1] ]
		gamedata["closest"] = closest

		gamesdata.append(gamedata)
		counter += 1
		if counter % 1000 == 0:
			print "processed " + str(counter) + " games. Outputting to " + output + str(counter/1000) + ".json"
			file = open(output + str(counter/1000) + ".json", "w")
			file.write(json.dumps(gamesdata, sort_keys=True, indent=2, separators=(",", ":")))
			file.close()
			gamesdata = []

	#get leftover games that weren't grouped into 1000
	print "processed " + str(counter) + " games. Outputting to " + output + str(math.ceil(float(counter)/1000))[:-2] + ".json"
	file = open(output + str(math.ceil(float(counter)/1000))[:-2] + ".json", "w")
	file.write(json.dumps(gamesdata, sort_keys=True, indent=2, separators=(",", ":")))
	file.close()
	gamesdata = []

	print "Sucessfully processsed 5 nearest neighbors for each game"

	gamefile.close();