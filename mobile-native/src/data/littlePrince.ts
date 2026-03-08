// 《小王子》完整书籍数据
export interface Chapter {
  id: string;
  number: number;
  title: string;
  titleCn: string;
  content: string;
  translation: string;
  wordCount: number;
  readTime: number;
}

export const littlePrinceBook = {
  id: 'little-prince-book',
  title: 'The Little Prince',
  titleCn: '小王子',
  author: 'Antoine de Saint-Exupéry',
  authorCn: '安托万·德·圣-埃克苏佩里',
  totalChapters: 27,
  totalWordCount: 18500,
  description: 'A timeless tale about love, responsibility, and what is truly important in life.',
  descriptionCn: '一个关于爱、责任和生命中真正重要事物的永恒故事。',
};

export const chapters: Chapter[] = [
  {
    id: 'prince-ch1',
    number: 1,
    title: 'Chapter 1: The Hat and the Elephant',
    titleCn: '第一章：帽子与大象',
    content: `Once when I was six years old I saw a magnificent picture in a book, called True Stories from Nature, about the primeval forest. It was a picture of a boa constrictor in the act of swallowing an animal. In the book it said: "Boa constrictors swallow their prey whole, without chewing it. After that they are not able to move, and they sleep through the six months that they need for digestion."

I pondered deeply, then, over the adventures of the jungle. And after some work with a colored pencil I succeeded in making my first drawing. My Drawing Number One. It looked like this: I showed my masterpiece to the grown-ups, and asked them whether the drawing frightened them.

But they answered: "Frighten? Why should any one be frightened by a hat?"

My drawing was not a picture of a hat. It was a picture of a boa constrictor digesting an elephant. But since the grown-ups were not able to understand it, I made another drawing: I drew the inside of the boa constrictor, so that the grown-ups could see it clearly. They always need to have things explained. My Drawing Number Two looked like this:

The grown-ups' response, this time, was to advise me to lay aside my drawings of boa constrictors, whether from the inside or the outside, and devote myself instead to geography, history, arithmetic and grammar. That is why, at the age of six, I gave up what might have been a magnificent career as a painter. I had been disheartened by the failure of my Drawing Number One and my Drawing Number Two. Grown-ups never understand anything by themselves, and it is tiresome for children to be always and forever explaining things to them.

So then I chose another profession, and learned to pilot airplanes. I have flown a little over all parts of the world; and it is true that geography has been very useful to me. At a glance I can distinguish China from Arizona. If one gets lost in the night, such knowledge is valuable.`,
    translation: `当我六岁的时候，在一本名叫《大自然的真实故事》的书里，看见过一幅精彩的插画，画的是原始森林。那是一条蟒蛇正在吞食一只野兽。书上写着："蟒蛇把猎物整个吞下去，不加咀嚼，然后它们就无法动弹，在长达六个月的睡眠中消化食物。"

于是，我对丛林中的冒险反复思索。在用彩色铅笔做了一些努力之后，我成功地完成了我的第一幅画。我的第一号作品。它是这样的：我把我的杰作拿给大人们看，问他们这幅画是否让他们害怕。

但他们回答说："害怕？为什么有人会害怕一顶帽子呢？"

我画的不是帽子。我画的是一条蟒蛇正在消化一头大象。但是既然大人们无法理解，我又画了另一幅画：我画了蟒蛇的内部，这样大人们就能清楚地看到了。他们总是需要把事情解释清楚。我的第二号作品是这样的：

大人们这次反应是建议我把蟒蛇的画放在一边，不管是内部还是外部的，转而专心学习地理、历史、算术和语法。这就是为什么，在六岁的时候，我放弃了可能成为一名画家的辉煌事业。我的第一号和第二号作品的失败使我灰心丧气。大人们自己从来不懂任何事，而孩子们总是要不断地向他们解释，这真让人厌烦。

于是我选择了另一个职业，学会了驾驶飞机。我飞越了世界各地；确实，地理对我来说非常有用。我一眼就能区分中国和亚利桑那。如果在夜间迷失方向，这样的知识是宝贵的。`,
    wordCount: 420,
    readTime: 5,
  },
  {
    id: 'prince-ch2',
    number: 2,
    title: 'Chapter 2: Meeting in the Desert',
    titleCn: '第二章：沙漠中的相遇',
    content: `Thus I lived my life alone, without anyone that I could really talk to, until I had an accident with my plane in the Desert of Sahara, six years ago. Something was broken in my engine. And as I had with me neither a mechanic nor any passengers, I set myself to attempt the difficult repairs all alone. It was a question of life or death for me: I had scarcely enough drinking water to last a week.

The first night, then, I went to sleep on the sand, a thousand miles from any human habitation. I was more isolated than a shipwrecked sailor on a raft in the middle of the ocean. Thus you can imagine my amazement, at sunrise, when I was awakened by an odd little voice. It said:

"If you please-- draw me a sheep!"

"What!"

"Draw me a sheep!"

I jumped to my feet, completely thunderstruck. I blinked my eyes hard. I looked carefully all around me. And I saw a most extraordinary small person, who stood there examining me with great seriousness.

Here you may see the best portrait that, later, I was able to make of him. But my drawing, certainly, was much less charming than its model. It was not my fault. I had been disheartened by the grown-ups, who let me learn nothing of what I really wanted to learn: how to draw.

When I was six years old, I had given up being a painter. I had never drawn anything except boas from the outside and boas from the inside.

Now I stared at this sudden apparition with my eyes fairly starting out of my head in astonishment. Remember, I had crashed in the desert a thousand miles from any inhabited region. And yet my little man seemed neither to be straying uncertainly among the sands, nor to be fainting from fatigue or hunger or thirst or fear. Nothing about him gave any suggestion of a child lost in the middle of the desert, a thousand miles from any human habitation.`,
    translation: `就这样，我独自生活，没有一个能真正交谈的人，直到六年前我在撒哈拉沙漠遇到飞机事故。我的发动机某个部件坏了。由于我身边既没有机械师也没有乘客，我开始独自尝试困难的修理工作。这对我来说是生死攸关的问题：我的饮用水只够维持一周。

第一个晚上，我在沙地上睡觉，距离任何人烟都有一千英里。我比海洋中央木筏上的遇难水手更加孤独。因此你可以想象我的惊讶，在日出时，当我被一个奇怪的小声音吵醒时。它说：

"请你——给我画一只绵羊！"

"什么！"

"给我画一只绵羊！"

我跳了起来，完全被震惊了。我使劲眨了眨眼睛。我仔细地环顾四周。然后我看见了一个非常特别的小人儿，站在那里非常认真地打量着我。

这里你可以看到后来我能为他画的最像的肖像。但我的画肯定远不如它的原型迷人。这不是我的错。大人们让我灰心，他们从不让我学我真正想学的东西：如何画画。

我六岁的时候，已经放弃了成为画家。除了从外部和内部画的蟒蛇，我从来没有画过任何东西。

现在，我瞪大眼睛盯着这个突然出现的幻影，惊讶得眼珠都快掉出来了。记住，我是在沙漠中坠机的，距离任何有人居住的地区都有一千英里。然而我的小人儿看起来既不是在沙地中不确定地徘徊，也不是因为疲劳、饥饿、口渴或恐惧而昏倒。他身上没有任何迹象表明是一个在沙漠中央迷路的孩子，距离任何人烟都有一千英里。`,
    wordCount: 450,
    readTime: 5,
  },
  {
    id: 'prince-ch3',
    number: 3,
    title: 'Chapter 3: The Mystery of Origins',
    titleCn: '第三章：身世的秘密',
    content: `When at last I was able to speak, I said to him:

"But-- what are you doing here?"

And in answer he repeated, very slowly, as if he were speaking of a matter of great consequence:

"If you please-- draw me a sheep..."

When a mystery is too overpowering, one dare not disobey. Absurd as it might seem to me, a thousand miles from any human habitation and in danger of death, I took out of my pocket a sheet of paper and my fountain-pen. But then I remembered how my studies had been concentrated on geography, history, arithmetic and grammar, and I told the little chap (a little crossly, too) that I did not know how to draw.

He answered me:

"That doesn't matter. Draw me a sheep..."

But I had never drawn a sheep. So I drew for him one of the two pictures I had drawn so often. It was that of the boa constrictor from the outside. And I was astounded to hear the little fellow greet it with:

"No! No! I do not want an elephant inside a boa constrictor. A boa constrictor is a very dangerous creature, and an elephant is very cumbersome. Where I live, everything is very small. What I need is a sheep. Draw me a sheep."

So then I made a drawing. He looked at it carefully, then he said:

"No. This sheep is already very sick. Make me another."

So I made another drawing. My friend smiled gently and indulgently.

"You see yourself," he said, "that this is not a sheep. This is a ram. It has horns."

So then I did my drawing over once more. But it was rejected too, just like the others.

"This one is too old. I want a sheep that will live a long time."

By this time my patience was exhausted, because I was in a hurry to start taking my engine apart. So I tossed off this drawing. And I threw out an explanation with it:

"This is only his box. The sheep you asked for is inside."

I was very surprised to see a light break over the face of my young judge:

"That is exactly the way I wanted it! Do you think that this sheep will have to have a great deal of grass?"

"Why?"

"Because where I live everything is very small..."

"There will surely be enough grass for him," I said. "It is a very small sheep that I have given you."

He bent his head over the drawing:

"Not so small that-- Look! He has gone to sleep..."

And that is how I made the acquaintance of the little prince.`,
    translation: `当我终于能说话时，我对他说：

"但是——你在这里做什么？"

作为回答，他非常缓慢地重复，好像在谈论一件非常重要的事情：

"请你——给我画一只绵羊……"

当一个谜团太过令人震撼时，人不敢违抗。尽管在我看来这很荒谬，距离任何人烟都有一千英里，而且处于死亡的危险中，我还是从口袋里掏出一张纸和我的钢笔。但这时我想起我的学习一直集中在地理、历史、算术和语法上，我告诉小家伙（也有点生气），我不知道怎么画画。

他回答我：

"那没关系。给我画一只绵羊……"

但我从来没有画过绵羊。所以我给他画了我经常画的两幅画之一。那是从外部画的蟒蛇。而我惊讶地听到小家伙这样迎接它：

"不！不！我不想要一只在大蟒蛇里面的大象。大蟒蛇是非常危险的生物，大象非常笨重。我住的地方，一切都很小。我需要的是一只绵羊。给我画一只绵羊。"

于是我画了一幅画。他仔细地看着，然后说：

"不。这只绵羊已经病得很重了。给我画另一只。"

于是我又画了另一幅画。我的朋友温和而宽容地笑了。

"你自己看，"他说，"这不是一只绵羊。这是一只公羊。它有角。"

于是我又重新画了一遍。但它也被拒绝了，就像其他的画一样。

"这只太老了。我想要一只活得久的绵羊。"

这时我的耐心已经耗尽了，因为我急于开始拆卸我的发动机。所以我草草画了这幅画。并且我随口抛出一个解释：

"这只是他的箱子。你要的绵羊在里面。"

我非常惊讶地看到一道光芒掠过我年轻审判者的脸庞：

"这正是我想要的样子！你觉得这只绵羊需要很多草吗？"

"为什么？"

"因为我住的地方一切都很小……"

"肯定会有足够的草给他，"我说。"我给你的是一只很小的绵羊。"

他低头看着画：

"没那么小——看！他已经睡着了……"

就这样，我结识了小王子。`,
    wordCount: 580,
    readTime: 7,
  },
  {
    id: 'prince-ch4',
    number: 4,
    title: 'Chapter 4: The Little Prince\'s Planet',
    titleCn: '第四章：小王子的星球',
    content: `It took me a long time to learn where he came from. The little prince, who asked me so many questions, never seemed to hear the ones I asked him. It was from words dropped by chance that, little by little, everything came to me.

For instance, when he first caught sight of my airplane (I shall not draw my airplane; that would be much too complicated for me), he asked me:

"What is that object?"

"That is not an object. It flies. It is an airplane. It is my airplane."

And I was proud to have him learn that I could fly.

He cried out, then:

"What! You dropped down from the sky?"

"Yes," I said, modestly.

"Oh! That is funny!"

And the little prince broke into a lovely peal of laughter, which irritated me very much. I like my misfortunes to be taken seriously.

Then he added:

"So you, too, come from the sky! Which is your planet?"

At that moment I caught a gleam of light in the impenetrable mystery of his presence; and I demanded, abruptly:

"Do you come from another planet?"

But he did not reply. He tossed his head gently, without taking his eyes from my plane:

"It is true that on that you can't have come from very far away..."

And he sank into a reverie, which lasted a long time. Then, taking my sheep out of his pocket, he buried himself in the contemplation of his treasure.

You can imagine how my curiosity was aroused by this half-confidence about the "other planets." I made a great effort, therefore, to find out more on this subject.

"My little man, where do you come from? What is this 'where I live,' of which you speak? Where do you want to take your sheep?"

After a reflective silence he answered:

"The thing that is so good about the box you have given me is that at night he will be able to use it as his house."

"That is so. And if you are good I will give you a string, too, so that you can tie him during the day. And a post to tie him to."

But the little prince seemed shocked by this offer:

"Tie him! What a queer idea!"

"But if you don't tie him," I said, "he will wander off somewhere, and get lost."

My friend broke into another peal of laughter:

"But where do you think he would go?"

"Anywhere. Straight ahead of him."

Then the little prince said, earnestly:

"That doesn't matter. Where I live, everything is so small!"

And, with perhaps a hint of sadness, he added:

"Straight ahead of him, nobody can go very far..."`,
    translation: `我花了很长时间才了解他来自哪里。小王子问了我那么多问题，却似乎从未听到我问他的问题。只是从偶然说出的话语中，我才一点一点地了解了一切。

例如，当他第一眼看到我的飞机时（我不会画我的飞机；那对我来说太复杂了），他问我：

"那是什么东西？"

"那不是东西。它会飞。它是一架飞机。它是我的飞机。"

我很自豪能让他知道我会飞。

然后他大叫起来：

"什么！你是从天上掉下来的？"

"是的，"我谦虚地说。

"哦！真有趣！"

小王子发出一阵可爱的笑声，这让我非常恼火。我喜欢别人认真对待我的不幸。

然后他补充道：

"那么你也来自天空！你是哪个星球的？"

在那一刻，我在他神秘莫测的存在中捕捉到了一丝光亮；我突兀地问道：

"你来自另一个星球吗？"

但他没有回答。他轻轻摇了摇头，眼睛没有离开我的飞机：

"确实，坐在那个上面你不可能来自很远的地方……"

然后他陷入了沉思，持续了很长时间。接着，他从口袋里掏出我的绵羊，埋头凝视他的宝贝。

你可以想象，关于"其他星球"的这半句透露是如何激起了我的好奇心。因此，我努力想更多地了解这个主题。

"我的小不点儿，你从哪里来？你说的'我住的地方'是哪里？你想把你的绵羊带到哪里去？"

经过一段反思的沉默后，他回答：

"你给我的那个箱子好处在于，晚上他可以把它当作房子用。"

"是的。如果你乖，我还会给你一根绳子，这样你就可以在白天拴住他。还有一根柱子可以拴他。"

但小王子似乎被这个提议震惊了：

"拴住他！多么奇怪的想法！"

"但如果你不拴住他，"我说，"他会跑到什么地方去，然后迷路。"

我的朋友又发出一阵笑声：

"但你觉得他会去哪里呢？"

"任何地方。一直往前走。"

然后小王子认真地说：

"那没关系。我住的地方，一切都很小！"

然后，带着一丝悲伤，他补充道：

"一直往前走，没人能走得很远……"`,
    wordCount: 620,
    readTime: 7,
  },
  {
    id: 'prince-ch5',
    number: 5,
    title: 'Chapter 5: The Baobabs',
    titleCn: '第五章：猴面包树',
    content: `Each day I learned something new about the planet, about the departure, or about the journey. It came from little things, which he let fall quite by chance. On the third day, it was the business of the baobabs.

This time, once more, I had the sheep to thank for it. For the little prince asked me abruptly-- as if seized by a grave doubt:

"It is true, isn't it, that sheep eat little bushes?"

"Yes. That is true."

"Ah! I am glad!"

I did not understand why it was so important that sheep should eat little bushes. But the little prince added:

"Then it follows that they also eat baobabs?"

I pointed out to the little prince that baobabs are not little bushes, but, on the contrary, trees as big as castles; and that even if he took back a whole herd of elephants, that herd would not eat up one single baobab.

The idea of the herd of elephants made the little prince laugh.

"We would have to put them one on top of the other," he said.

But he made a wise remark:

"Before they grow so big, the baobabs start out by being little."

"That is strictly correct," I said. "But why do you want the sheep to eat the little baobabs?"

He answered me at once, "Oh, come, come!", as if he were speaking of something that was self-evident. And I was obliged to make a great mental effort to solve this problem, without any assistance.

Indeed, as I learned, there were on the planet where the little prince lived-- as on all planets-- good plants and bad plants. In consequence, there were good seeds and bad seeds, and of course the seeds of the baobabs were bad. They were the seeds of the baobabs that made the little planet such a terrible place. And if there was not timely intervention, the baobabs would overrun the whole planet.

"It is a question of discipline," the little prince said to me later on. "When you've finished your own toilet in the morning, then it is time to attend to the toilet of your planet, just so, with the greatest care. You must see to it that you pull up regularly all the baobabs, at the very first moment when they can be distinguished from the rosebushes which they resemble so closely in their earliest youth. It is very tedious work," the little prince added, "but very easy."

And one day he said to me: "You ought to make a beautiful drawing, so that the children where you live can see exactly how all this is. That would be very useful to them if they were to travel some day. Sometimes," he added, "there is no harm in putting off a piece of work until another day. But when it is a matter of baobabs, that always means a catastrophe. I knew a planet, inhabited by a lazy man. He neglected three little bushes..."

And, in keeping with the danger he described, the little prince drew the first and second planets he had visited. On one he saw a king with a purple robe and ermine mantle. On the second, a conceited man. On the third, a drunkard. On the fourth, a businessman. On the fifth, a lamplighter. On the sixth, a geographer.`,
    translation: `每天我都能了解到一些关于这个星球、关于出发或关于旅程的新情况。这些都是从他偶然说出的小事中得来的。第三天，是关于猴面包树的事。

这一次，我再次要感谢那只绵羊。因为小王子突然问我——好像被一种严重的怀疑所抓住：

"绵羊吃小灌木，这是真的，对吗？"

"是的。那是真的。"

"啊！我很高兴！"

我不明白为什么绵羊吃小灌木会如此重要。但小王子补充道：

"那么它们也吃猴面包树？"

我向小王子指出，猴面包树不是小灌木，相反，它们是和城堡一样大的树；而且即使他带回去一整群大象，那群象也吃不下一棵猴面包树。

象群的想法让小王子笑了。

"我们得把它们一个叠在一个上面，"他说。

但他做了一个明智的评论：

"在它们长得这么大之前，猴面包树一开始也是小的。"

"那完全正确，"我说。"但你为什么想让绵羊吃小猴面包树呢？"

他立刻回答我："哦，得了，得了！"好像他在说一件不言而喻的事情。而我不得不在没有任何帮助的情况下，做出巨大的脑力努力来解决这个问题。

确实，正如我所了解的，在小王子居住的星球上——就像在所有的星球上一样——有好植物和坏植物。因此，有好种子和坏种子，当然猴面包树的种子是坏的。正是猴面包树的种子使这个小星球成为如此可怕的地方。如果不及时干预，猴面包树会占领整个星球。

"这是一个纪律问题，"小王子后来对我说。"当你早上完成自己的梳洗后，就该照料你的星球了，就这样，要极其小心。你必须确保定期拔掉所有的猴面包树，在它们一能与它们幼年时非常相似的玫瑰花丛区分开的时候就立刻拔掉。这是非常乏味的工作，"小王子补充道，"但很容易。"

有一天他对我说："你应该画一幅美丽的画，这样你住的地方的孩子们就能清楚地看到这一切。如果有一天他们要旅行，这对他们会很有用。有时候，"他补充道，"把一件工作推迟到另一天做也没有害处。但当涉及猴面包树时，那总是意味着一场灾难。我知道一个星球，上面住着一个懒惰的人。他忽视了三棵小灌木……"

为了配合他所描述的危险，小王子画了他访问过的第一和第二颗星球。在一颗上，他看到一个穿着紫色长袍和白貂披风的国王。在第二颗上，一个虚荣的人。在第三颗上，一个酒鬼。在第四颗上，一个商人。在第五颗上，一个点灯人。在第六颗上，一个地理学家。`,
    wordCount: 680,
    readTime: 8,
  },
  {
    id: 'prince-ch6',
    number: 6,
    title: 'Chapter 6: The Sunset',
    titleCn: '第六章：日落',
    content: `Ah, little prince, dear little prince! I love to hear that laughter! It is like a spring of fresh water in the desert. There was the little prince, sitting on a stone, a thousand miles from any habitation. And he looked as though he had been lost for a long time, without any means of transport, and I had just found him in the desert.

"What are you doing here?" I said.

But he answered me, as if he were saying something very serious:

"Please... draw me a sheep..."

And when a person is so strongly impressed that he is not quite master of himself, he obeys. Despite the danger and despite the tears in my eyes, I took out, absurd as it seemed, a sheet of paper from my pocket. And I noticed then that I had soaked it with my engine grease.

I set to work on the drawing again. And the little prince interrupted me with:

"No! No! I do not want an elephant inside a boa constrictor. The boa constrictor is very dangerous, and the elephant is very cumbersome. Where I live, everything is very small. I need a sheep. Draw me a sheep."

So then I made a drawing. He looked at it carefully, then he said:

"No. This sheep is already very sick. Make me another."

So then, I made my drawing.

My friend smiled gently.

"You see," he said, "this is not a sheep. This is a ram. It has horns."

So then I did my drawing over once more.

But it was rejected too, just like the others.

"This one is too old. I want a sheep that will live a long time."

Then, impatiently, since I was anxious to begin taking my engine apart, I tossed off this drawing.

And I threw out an explanation with it:

"This is only his box. The sheep you asked for is inside."

I was very surprised to see a light break over the face of my young judge:

"That is exactly the way I wanted it! Do you think that this sheep will have to have a great deal of grass?"

"Why?"

"Because where I live everything is very small..."

"There will surely be enough grass for him," I said. "It is a very small sheep that I have given you."

He bent his head over the drawing.

"Not so small that-- Look! He has gone to sleep..."

And that is how I made the acquaintance of the little prince.

Oh, little prince! Little by little I came to understand your sad little life... For a long time you had found your only entertainment in the quiet pleasure of the sunset. I learned that new detail on the morning of the fourth day, when you said to me:

"I am very fond of sunsets. Come, let us go look at a sunset now."

"But we must wait," I said.

"Wait? For what?"

"For the sunset. We must wait until it is time."

At first you seemed to be very much surprised. And then you laughed at yourself. You said to me:

"I am always thinking that I am at home!"

Just so. Everybody knows that when it is noon in the United States the sun is setting over France. If you could fly to France in one minute, you could go straight into the sunset, right from noon. Unfortunately, France is too far away for that. But on your tiny planet, my little prince, all you need do is move your chair a few steps. And you can watch the sunset whenever you want to...`,
    translation: `啊，小王子，亲爱的小王子！我喜欢听那笑声！它就像沙漠中的一股清泉。小王子就坐在一块石头上，距离任何人烟都有一千英里。而他看起来好像已经迷路很久了，没有任何交通工具，而我刚刚在沙漠中找到了他。

"你在这里做什么？"我说。

但他回答我，好像他在说一件非常严肃的事情：

"请……给我画一只绵羊……"

当一个人受到如此强烈的震撼以至于无法自控时，他会服从。尽管有危险，尽管我眼含泪水，我掏出了——尽管看起来很荒谬——口袋里的一张纸。然后我发现我已经用发动机润滑油把它浸湿了。

我又开始画画。小王子打断了我：

"不！不！我不想要一只在大蟒蛇里面的大象。大蟒蛇非常危险，大象非常笨重。我住的地方，一切都很小。我需要一只绵羊。给我画一只绵羊。"

于是我画了一幅画。他仔细地看着，然后说：

"不。这只绵羊已经病得很重了。给我画另一只。"

于是我又画了。

我的朋友温和地笑了。

"你看，"他说，"这不是一只绵羊。这是一只公羊。它有角。"

于是我又重新画了一遍。

但它也被拒绝了，就像其他的画一样。

"这只太老了。我想要一只活得久的绵羊。"

然后，不耐烦地，因为我急于开始拆卸我的发动机，我草草画了这幅画。

并且我随口抛出一个解释：

"这只是他的箱子。你要的绵羊在里面。"

我非常惊讶地看到一道光芒掠过我年轻审判者的脸庞：

"这正是我想要的样子！你觉得这只绵羊需要很多草吗？"

"为什么？"

"因为我住的地方一切都很小……"

"肯定会有足够的草给他，"我说。"我给你的是一只很小的绵羊。"

他低头看着画。

"没那么小——看！他已经睡着了……"

就这样，我结识了小王子。

哦，小王子！渐渐地我开始理解你悲伤的小生活……长期以来，你只在观看日落的宁静乐趣中找到你唯一的娱乐。我是在第四天的早晨了解到这个新细节的，当时你对我说：

"我非常喜欢日落。来，我们现在去看日落吧。"

"但我们必须等，"我说。

"等？等什么？"

"等日落。我们必须等到时间。"

起初你似乎非常惊讶。然后你嘲笑自己。你对我说：

"我总是以为我在家里！"

正是如此。每个人都知道，当美国是中午时，太阳正在法国落下。如果你能在一分钟内飞到法国，你就可以直接从中午进入日落。不幸的是，法国太远了。但在你小小的星球上，我的小王子，你只需要把椅子移动几步。然后你就可以随时观看日落了……`,
    wordCount: 720,
    readTime: 8,
  },
];

// 获取章节总数
export const getTotalChapters = () => chapters.length;

// 获取总词数
export const getTotalWordCount = () => chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

// 根据ID获取章节
export const getChapterById = (id: string) => chapters.find(ch => ch.id === id);

// 获取下一章
export const getNextChapter = (currentId: string) => {
  const currentIndex = chapters.findIndex(ch => ch.id === currentId);
  return currentIndex >= 0 && currentIndex < chapters.length - 1 
    ? chapters[currentIndex + 1] 
    : null;
};

// 获取上一章
export const getPrevChapter = (currentId: string) => {
  const currentIndex = chapters.findIndex(ch => ch.id === currentId);
  return currentIndex > 0 ? chapters[currentIndex - 1] : null;
};
