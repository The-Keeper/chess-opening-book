import { json } from '@sveltejs/kit';

export async function GET({ request }) {
	const { description } = await request.json();
	

	// const userid = cookies.get('userid');
	// const { id } = await database.createTodo({ userid, description });

	// const query = `https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz,rapid&ratings=400,600,800,1200&fen=rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR%20w%20KQkq%20-`
	//return json({ id }, { status: 201 });
}