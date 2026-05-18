class DynamicArray {
  constructor(items = []) {
    this.items = [...items];
  }
  add(item) {
    this.items.push(item);
  }
  deleteById(id) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) this.items.splice(index, 1);
  }
  update(id, newData) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) this.items[index] = { ...this.items[index], ...newData };
  }
  getAll() {
    return [...this.items];
  }
  findById(id) {
    return this.items.find(item => item.id === id);
  }
}

class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }
  append(value) {
    const node = new LinkedListNode(value);
    if (!this.head) {
      this.head = node;
      return;
    }
    let current = this.head;
    while (current.next) current = current.next;
    current.next = node;
  }
  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

class Stack {
  constructor() {
    this.items = [];
  }
  push(item) {
    this.items.push(item);
  }
  pop() {
    return this.items.pop();
  }
  peek() {
    return this.items[this.items.length - 1];
  }
  toArray() {
    return [...this.items].reverse();
  }
}

class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(item) {
    this.items.push(item);
  }
  dequeue() {
    return this.items.shift();
  }
  toArray() {
    return [...this.items];
  }
}

class BSTNode {
  constructor(movie) {
    this.movie = movie;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }
  insert(movie) {
    const node = new BSTNode(movie);
    if (!this.root) {
      this.root = node;
      return;
    }
    let current = this.root;
    while (true) {
      if (movie.title.toLowerCase() < current.movie.title.toLowerCase()) {
        if (!current.left) {
          current.left = node;
          return;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = node;
          return;
        }
        current = current.right;
      }
    }
  }
  search(title) {
    let current = this.root;
    const key = title.toLowerCase();
    while (current) {
      const currentTitle = current.movie.title.toLowerCase();
      if (currentTitle.includes(key)) return current.movie;
      current = key < currentTitle ? current.left : current.right;
    }
    return null;
  }
  inOrder() {
    const result = [];
    const traverse = node => {
      if (!node) return;
      traverse(node.left);
      result.push(node.movie);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }
}

function bubbleSort(items, key, direction = "asc") {
  const array = [...items];
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      const left = array[j][key];
      const right = array[j + 1][key];
      const needSwap = direction === "asc" ? left > right : left < right;
      if (needSwap) [array[j], array[j + 1]] = [array[j + 1], array[j]];
    }
  }
  return array;
}

function linearSearch(items, keyword) {
  const key = keyword.toLowerCase();
  return items.filter(item =>
    Object.values(item).some(value => String(value).toLowerCase().includes(key))
  );
}
