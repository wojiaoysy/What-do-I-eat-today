const state = {
  vegetables: { items: [], bag: [], last: -1 },
  meats: { items: [], bag: [], last: -1 },
};

function shuffledIndices(length, excludeFirst = -1) {
  const indices = Array.from({ length }, (_, index) => index);
  for (let i = indices.length - 1; i > 0; i--) {
    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    const j = random[0] % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  if (indices.length > 1 && indices[0] === excludeFirst) {
    [indices[0], indices[1]] = [indices[1], indices[0]];
  }
  return indices;
}

function nextFood(kind) {
  const group = state[kind];
  if (group.bag.length === 0) group.bag = shuffledIndices(group.items.length, group.last);
  const index = group.bag.shift();
  group.last = index;
  return group.items[index];
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderFood(kind, food) {
  const result = document.getElementById(kind === 'vegetables' ? 'vegetable-result' : 'meat-result');
  result.replaceChildren();
  result.append(element('p', 'result-overline', '今天的随机灵感'));
  const title = element('p', 'result-title');
  title.append(element('strong', '', food.name), element('span', '', food.group));
  result.append(title);

  if (kind === 'vegetables') {
    result.append(element('p', 'nutrition-label', '营养亮点'));
    const list = element('ul', 'nutrition-list');
    food.nutrition.split('、').forEach((keyword) => list.append(element('li', '', keyword)));
    result.append(list);
  }

  result.append(element('p', 'recipes-label', '换着花样做 · 3 道家常菜'));
  const recipes = element('ol', 'recipes-list');
  food.recipes.forEach((recipe, index) => {
    const match = recipe.match(/^(.+?)（(.+)）$/);
    const item = element('li');
    item.append(element('span', 'recipe-index', String(index + 1).padStart(2, '0')));
    const content = element('div', 'recipe-content');
    content.append(element('strong', '', match ? match[1] : recipe));
    if (match) content.append(element('span', '', ` · 配菜：${match[2]}`));
    item.append(content);
    recipes.append(item);
  });
  result.append(recipes);
  result.hidden = false;
}

async function main() {
  try {
    const response = await fetch('./foods.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const foods = await response.json();
    for (const kind of ['vegetables', 'meats']) {
      state[kind].items = foods[kind];
      const button = document.getElementById(kind === 'vegetables' ? 'vegetable-button' : 'meat-button');
      button.disabled = false;
      button.addEventListener('click', () => {
        renderFood(kind, nextFood(kind));
        button.querySelector('.button-label').textContent = '不想吃？重新生成';
      });
    }
  } catch (error) {
    document.getElementById('load-error').hidden = false;
    console.error('Failed to load food list', error);
  }
}

main();
