class Account
  attr_reader :name, :age

  def initialize(name:, age:)
    @name = name
    @age = age
  end
end
