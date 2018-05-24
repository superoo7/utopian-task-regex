const { main, isMention, isMentionPercent, extractNameWeightage } = require('./index')

describe('utopian-task', () => {
  // ================================================================================
  // MAIN TEST
  // ================================================================================

  it('!utopian should return beneficiaries', () => {
    /*
        INPUT: @utopian-bot !utopian      
        OUTPUT: 
        {               
            beneficiaries: []
        }

        POSSIBLE ERRORS
        - The whole sentence is not properly formatted
        - Some parts are missing or
        - Unrelated text is contained
        */
    let expectedResult = {
      beneficiaries: []
    }

    expect(main(`@utopian-bot !utopian`)).toEqual(expectedResult)
    expect(main(`@utopian-bit !utopian`).code).toEqual(1)
    expect(main(`@utopian-bot !utopien`).code).toEqual(2)
  })

  it('should throw error if more than 8 beneficiaries', () => {
    expect(
      main(
        `@utopian-bot !utopian @mention1 @mention2 @mention3 @mention4 @mention5 @mention6 @mention7 @mention8`
      ).code
    ).toBe(3)
    expect(
      main(
        `@utopian-bot !utopian @mention1:10% @mention2:10% @mention3:10% @mention4:10% @mention5:10% @mention6:10% @mention7:20% @mention8:20%`
      ).code
    ).toBe(3)
  })

  it('!utopian @mentions should return beneficiaries of each equally', () => {
    /*
        INPUT: @utopian-bot !utopian @mention1 @mention2 @mention3 @mention4
        OUTPUT:
        {
            beneficiaries: [
                    mention1: 25,
                    mention2: 25,
                    mention3: 25,
                    mention4: 25,
                ]
        }

        POSSIBLE ERRORS
        - The same username is mentioned multiple times, e.g. @user2 @user2 @user1
        - The text is not properly formatted, some parts are missing, or there is additional unrelated text.
    */

    // General Test
    let expectedResult1 = {
      beneficiaries: [{ mention1: 25 }, { mention2: 25 }, { mention3: 25 }, { mention4: 25 }]
    }
    expect(main(`@utopian-bot !utopian @mention1 @mention2 @mention3 @mention4`)).toEqual(
      expectedResult1
    )

    // The same username is mentioned multiple times, e.g. @user1 @user2 @user1
    expect(main(`@utopian-bot !utopian @user1 @user2 @user1 @mention4`).code).toEqual(4)

    // If there are 3 person (cannot properly use 100 to divide)
    let expectedResult2 = {
      beneficiaries: [{ mention1: 34 }, { mention2: 33 }, { mention3: 33 }]
    }
    expect(main(`@utopian-bot !utopian @mention1 @mention2 @mention3`)).toEqual(expectedResult2)
  })

  it('!utopian @mentions:15% should return beneficiaries of each', () => {
    /*
        INPUT: @utopian-bot !utopian @mention1:15% @mention2:35% @mention3:25% @mention4:25%
        OUTPUT:
          {
              beneficiaries: [
                      mention1: 15,
                      mention2: 35,
                      mention3: 25,
                      mention4: 25,
                  ]
          }

    */

    // General Test
    let expectedResult1 = {
      beneficiaries: [{ mention1: 15 }, { mention2: 35 }, { mention3: 25 }, { mention4: 25 }]
    }
    expect(
      main(`@utopian-bot !utopian @mention1:15% @mention2:35% @mention3:25% @mention4:25%`)
    ).toEqual(expectedResult1)

    // If total is not 100%
    expect(main(`@utopian-bot !utopian @mention1:15% @mention2:35% @mention3:25%`).code).toEqual(5)

    // If the input user are not unique
    expect(main(`@utopian-bot !utopian @mention1:35% @mention2:35% @mention1:30%`).code).toEqual(4)
  })

  // ================================================================================
  // REGEX TEST
  // ================================================================================
  it('mention @superoo7 should return true', () => {
    expect(isMention(`@superoo7`)).toBe(true)
    expect(isMention(`@superoo7-dev`)).toBe(true)
    expect(isMention(`@superoo7.dev`)).toBe(true)
    expect(isMention(`@superoo7.`)).toBe(false)
    expect(isMention(`superoo7`)).toBe(false)
  })

  it('mention @superoo7:15% return true', () => {
    expect(isMentionPercent(`@superoo7:15%`)).toBe(true)
    expect(isMentionPercent(`@superoo7-dev:10%`)).toBe(true)
    expect(isMentionPercent(`@superoo7.dev:22%`)).toBe(true)
    expect(isMentionPercent(`@superoo7.:12%`)).toBe(false)
    expect(isMentionPercent(`@superoo7:15`)).toBe(false)
    expect(isMentionPercent(`superoo7:15%`)).toBe(false)
  })

  it('extract out @mention1:15% into name and weightage', () => {
    expect(extractNameWeightage(`@superoo7:15%`)).toEqual({ name: 'superoo7', weightage: 15 })
    expect(extractNameWeightage(`@superoo7-dev:10%`)).toEqual({
      name: 'superoo7-dev',
      weightage: 10
    })
    expect(extractNameWeightage(`@superoo7.dev:22%`)).toEqual({
      name: 'superoo7.dev',
      weightage: 22
    })
  })
})
