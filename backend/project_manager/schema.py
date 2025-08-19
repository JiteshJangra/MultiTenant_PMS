import graphene
from core.schema import Query as CoreQuery, Mutation as CoreMutation

class Query(CoreQuery, graphene.ObjectType):
    pass

class Mutation(CoreMutation, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
