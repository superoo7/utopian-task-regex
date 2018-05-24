function main(inputString) {
  const stringArr = inputString.split(' ')

  // Check wether the string starts with '@utopian-bot !utopian'
  if (stringArr[0] !== '@utopian-bot') {
    return {
      error: `Expected the first part to be '@utopian-bot'`,
      code: 1
    }
  } else if (stringArr[1] !== '!utopian') {
    return {
      error: `Expected the second part to be '!utopian'`,
      code: 2
    }
  }

  // '@utopian-bot !utopian' return {beneficiaries: []}
  if (stringArr.length === 2) {
    return {
      beneficiaries: []
    }
  }

  // Remove '@utopian-bot !utopian'
  const users = stringArr.slice(2)

  if (users.length >= 8)
    return {
      error: `There are more than 8 beneficiaries.`,
      code: 3
    }

  const mentionUserPercent = users.filter(user => !isMentionPercent(user))
  const mentionUser = users.filter(user => !isMention(user))

  if (mentionUserPercent.length === 0) {
    // @mention1:15% @mention2:35% @mention3:25% @mention4:25%
    const filteredUser = users.map(user => extractNameWeightage(user))
    // If there is duplicate
    const findDuplicate = checkUnique(filteredUser.map(u => u.name))
    if (findDuplicate.length !== 0)
      return {
        error: `The input user： ${findDuplicate.join(', ')} are not unique`,
        code: 4
      }

    // If the total weightage is not 100%
    const totalWeightage = filteredUser.reduce((a, user) => user.weightage + a, 0)
    if (totalWeightage !== 100) return { error: `Total Weightage is not 100%`, code: 5 }

    const beneficiaries = filteredUser.map(user => {
      let obj = {}
      obj[user.name] = user.weightage
      return obj
    })

    return { beneficiaries: beneficiaries }
  } else if (mentionUser.length === 0) {
    // @mention1 @mention2 @mention3
    const findDuplicate = checkUnique(users.map(u => u.slice(1)))
    // If there is duplicate
    if (findDuplicate.length !== 0)
      return {
        error: `The input user： ${findDuplicate.join(', ')} are not unique`,
        code: 4
      }

    let beneficiaries = users.map(user => {
      let obj = {}
      obj[user.slice(1)] = Math.floor(100 / users.length)
      return obj
    })

    // OPTIONAL
    // If the given user is 3, the beneficiaries are not equal to 100, so add the extra to the first person
    const totalWeightage = Math.floor(100 / users.length) * users.length
    if (totalWeightage !== 100) {
      beneficiaries[0][users[0].slice(1)] += 100 - totalWeightage
    }

    return { beneficiaries: beneficiaries }
  } else {
    return {
      error: ``,
      code: 0
    }
  }
}

// check @mention

function isMention(input) {
  return !!input.match(/^[@]+[a-z][a-z0-9\-\.]+[a-z0-9]+$/)
}

// check @mention:15%

function isMentionPercent(input) {
  return !!input.match(/^[@]+[a-z][a-z0-9\-\.]+[a-z0-9]+\:+[0-9]+\%$/)
}

function extractNameWeightage(input) {
  let res = input.match(/@(.*?):(.*?)%$/)
  return {
    name: res[1],
    weightage: parseInt(res[2])
  }
}

function checkUnique(names) {
  // https://stackoverflow.com/questions/840781/get-all-non-unique-values-i-e-duplicate-more-than-one-occurrence-in-an-array
  const uniq = names
    .map(name => {
      return { count: 1, name: name }
    })
    .reduce((a, b) => {
      a[b.name] = (a[b.name] || 0) + b.count
      return a
    }, {})

  const duplicates = Object.keys(uniq).filter(a => uniq[a] > 1)
  return duplicates
}

module.exports = { main, isMention, isMentionPercent, extractNameWeightage }
