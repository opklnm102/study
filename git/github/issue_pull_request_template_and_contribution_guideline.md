# [Github] issue, pull request template and contribution guideline
> date - 2018.07.29  
> keyword - github, issue template, pull request template, contribution guideline  
> github의 issue, pull request template, contributor guideline 기능에 대해 정리  
> 모든 과정은 [issue-template-sample](https://github.com/opklnm102/issue-template-sample)에 남아있다

<br>

* issue, pull request template을 사용하면 참여자가 issue, pull request `작성시 포함시킬 정보를 표준화`할 수 있다
* contribution guideline을 사용하면 issue, pull request 생성시 해당 링크를 표시해 contributor에게 `guideline을 제시`할 수 있다

<br>

## Issue Template 만들기
* template builder를 사용하여 각 template의 title, description을 지정하여 생성
* issue template을 생성하려면 [Creating issue templates for your repository](https://help.github.com/articles/creating-issue-templates-for-your-repository)를 참고
* 이슈 생성시 `.github/ISSUE_TEMPLATE`에 저장된 template들을 자동으로 로딩한다

#### template 위치
```
├── .github
│   └── ISSUE_TEMPLATE
│       ├── bug_report.md
│       └── custom_template.md
└── README.md
```

> #### Issue란?
> * 모든 것이 이슈다
>   * 새롭게 추가될 기능에 대한 작업
>   * 기능 개선에 필요한 작업
>   * 버그에 대한 수정 작업
>   * 새로운 기능 제안
>   * 기능 개선 제안
>   * 질문
> * 모든 활동을 이슈로 등록하고 등록한 이슈를 통해 관리

---

<br>

## Pull Request Template 만들기
* pull request template을 생성하려면 [Creating a pull request template for your repository](https://help.github.com/articles/creating-a-pull-request-template-for-your-repository/)를 참고

#### template 위치
```
├── .github
│   └── pull_request.md
└── README.md
```

---

<br>

## contribution guideline 만들기
* project 참여자가 기여할 수 있는 guideline 파일
* issue, pull request 생성시 링크가 표시된다
* [Setting guidelines for repository contributors](https://help.github.com/articles/setting-guidelines-for-repository-contributors/)

#### contribution guideline 위치
```
├── .github
│   └── CONTRIBUTING.md
└── README.md
```

---

<br>

> #### 참고
> * [About issue and pull request templates](https://help.github.com/articles/about-issue-and-pull-request-templates/)
> * [Creating issue templates for your repository](https://help.github.com/articles/creating-issue-templates-for-your-repository)
> * [Creating a pull request template for your repository](https://help.github.com/articles/creating-a-pull-request-template-for-your-repository/)
> * [Setting guidelines for repository contributors](https://help.github.com/articles/setting-guidelines-for-repository-contributors/)
