const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server')
const bcrypt = require('bcryptjs')

const userA = { username: 'userA', password: 'passwordForA' }
const userB = { username: 'userB', password: 'PassWordForB' }
const userC = { username: 'userC', password: 'PassWordForC' }

afterAll(async () => {
  await db.destroy()
})

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async () => {
  await db('users').truncate()
})


it("correct env var", () => {
  expect(process.env.NODE_ENV).toBe("testing")
})

describe('Users model', () => {
  describe('[REGISTER] / User register correctly', () => {
    beforeEach(async () => {
      await request(server).post('/api/auth/register').send(userA)
      await request(server).post('/api/auth/register').send(userB)
    })
    test('[1] can add users into DB', async () => {
      const users = await db('users')
      expect(users).toHaveLength(2)
      expect(users[0]).toHaveProperty('username', 'userA')
      expect(users[1]).toHaveProperty('id', 2)
    })
    test('[2] hashed password saved correctly', async () => {
      await request(server).post('/api/auth/register').send(userC)
      let user = await db('users')
      const bool = bcrypt.compareSync(userC.password, user[2].password)
      expect(bool).toBe(true)
    })
  })
  describe('[LOGIN] / authorization', () => {
    beforeEach(async () => {
      await request(server).post('/api/auth/register').send(userA)
      await request(server).post('/api/auth/register').send(userB)
    })
    test('[3] Validate user', async () => {
      const res = await request(server).post('/api/auth/login').send(userA)
      let user = await db('users')
      const bool = bcrypt.compareSync(userA.password, user[0].password)
      expect(bool).toBe(true)
      expect(res).toHaveProperty('status', 200)
    })
    test('[4] Invalid user error status', async () => {
      const res = await request(server).post('/api/auth/login').send({
        username: 'userA',
        password: 'wrongPassword'
      })
      let user = await db('users').where('username', 'userA')
      const bool = bcrypt.compareSync('wrongPassword', user[0].password)
      expect(bool).toBe(false)
      expect(res.status + '').toMatch(/4|5/)
      expect(user).toHaveLength(1)
    })
  })
})
