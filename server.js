const Sequelize = require ('sequelize');
const { STRING, UUID, UUIDV4 } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/nintendo_db');
const express = require('express');
const app = express();

app.get('/api/consoles', async(req, res, next)=>{
  try {
    res.send(await Console.findAll({
      include: {
        model: Console,
        as:'lite'
      }
    }))
  } catch (error) {
    next (error)
  }
})

app.get('/api/games', async(req, res, next)=>{
  try {
    res.send(await Game.findAll({
      include: {
        model: Console,
      }
    }))
  } catch (error) {
    next(error)
  }
})

const Console = conn.define('console', {
  name: {
    type: STRING(20)
  }
})

const Game = conn.define('game', {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4
  },
  name: {
    type: STRING(20)
  }
});

Game.belongsTo(Console, {as: 'nsgame'});
Console.hasMany(Game, { foreignKey: 'nsgameId'})
Console.belongsTo(Console, {as: 'lite'})




const syncAndSeed = async() => {
  await conn.sync({ force: true});
  const [Pokemon, ZeldaBow, SuperMario, NS, NSLite] = await Promise.all([
    Game.create({name:'Pokemon'}),
    Game.create({name:'ZeldaBow'}),
    Game.create({name:'SuperMario'}),
    Console.create({name: 'NS'}),
    Console.create({name: 'NSLite'})
  ]);
  NS.nsgameId =ZeldaBow.id;
  await NS.save();
  NSLite.liteId = NSLite.id;
  await NSLite.save();
};

const init = async() => {
  try {
    await conn.authenticate();
    await syncAndSeed();
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`))
  } catch (error) {
    console.log(error)
  }
}

init();
